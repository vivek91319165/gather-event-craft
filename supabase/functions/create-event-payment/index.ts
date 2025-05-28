
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { eventId, registrationId } = await req.json();

    if (!eventId || !registrationId) {
      throw new Error("Event ID and registration ID are required");
    }

    // Create Supabase client with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('id, title, price, currency, is_free')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error("Event not found");
    }

    if (event.is_free) {
      throw new Error("This is a free event, no payment required");
    }

    if (!event.price || event.price <= 0) {
      throw new Error("Invalid event price");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: event.currency,
            product_data: { 
              name: `Event Registration: ${event.title}`,
              description: `Registration for ${event.title}`,
            },
            unit_amount: Math.round(event.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?cancelled=true`,
      metadata: {
        eventId: eventId,
        registrationId: registrationId,
        userId: user.id,
      },
    });

    // Create payment record in database
    const { error: paymentError } = await supabaseClient
      .from("event_payments")
      .insert({
        event_id: eventId,
        user_id: user.id,
        registration_id: registrationId,
        stripe_session_id: session.id,
        amount: event.price,
        currency: event.currency,
        status: "pending",
      });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      // Don't throw here, as the Stripe session was created successfully
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
