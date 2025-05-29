
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventFormData } from '@/types/event';
import { toast } from '@/hooks/use-toast';

export interface QRCodeData {
  id: string;
  registrationId: string;
  qrCodeData: string;
  createdAt: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // First fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Then fetch organizer profiles separately
      const organizerIds = eventsData.map(event => event.organizer_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', organizerIds);

      if (profilesError) throw profilesError;

      // Create a map of organizer profiles
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      const formattedEvents: Event[] = eventsData.map(event => {
        const organizer = profilesMap.get(event.organizer_id);
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          startDate: event.start_date,
          endDate: event.end_date,
          location: event.location || '',
          eventType: event.event_type as 'Hackathon' | 'Meetup' | 'Webinar',
          image: event.image_url,
          tags: event.tags || [],
          attendees: event.attendees || 0,
          maxAttendees: event.max_attendees,
          isOnline: event.is_online || false,
          createdAt: event.created_at,
          organizerName: organizer?.full_name || organizer?.username || 'Unknown Organizer',
          registrationEnabled: event.registration_enabled || true,
          isFree: event.is_free || true,
          price: event.price,
          currency: event.currency || 'usd',
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (formData: EventFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create events.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
          location: formData.location,
          event_type: formData.eventType,
          tags: formData.tags,
          max_attendees: formData.maxAttendees,
          is_online: formData.isOnline,
          organizer_id: user.id,
          is_free: formData.isFree,
          price: formData.isFree ? null : formData.price,
          currency: formData.currency,
          attendees: 0, // Initialize with 0 attendees
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event Created Successfully!",
        description: `${formData.title} has been created and is now live.`,
      });

      // Refresh events list
      await fetchEvents();
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Start a database transaction by using a single query for consistency
      const { data: existingRegistration, error: checkError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event.",
          variant: "destructive"
        });
        return;
      }

      // Get event details to check capacity and payment requirements
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('is_free, price, title, max_attendees, attendees')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Check if event is at capacity
      if (eventData.max_attendees && eventData.attendees >= eventData.max_attendees) {
        toast({
          title: "Event Full",
          description: "This event has reached its maximum capacity.",
          variant: "destructive"
        });
        return;
      }

      // Register user for the event
      const { data: registration, error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
        })
        .select()
        .single();

      if (registrationError) {
        console.error('Registration error:', registrationError);
        throw registrationError;
      }

      console.log('User registered successfully:', registration);

      // Handle payment for paid events
      if (!eventData.is_free && eventData.price && eventData.price > 0) {
        try {
          const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
            'create-event-payment',
            {
              body: {
                eventId: eventId,
                registrationId: registration.id,
              },
            }
          );

          if (paymentError) throw paymentError;

          if (paymentData?.url) {
            // Open Stripe checkout in a new tab
            window.open(paymentData.url, '_blank');
            
            toast({
              title: "Payment Required",
              description: "Please complete your payment to confirm registration.",
            });
            return;
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError);
          // Delete the registration if payment setup fails
          await supabase
            .from('event_registrations')
            .delete()
            .eq('id', registration.id);
          
          toast({
            title: "Payment Error",
            description: "Failed to set up payment. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }

      // For free events, update attendee count immediately
      const newAttendeeCount = (eventData.attendees || 0) + 1;

      // Update the event's attendee count in the database
      const { error: updateError } = await supabase
        .from('events')
        .update({ attendees: newAttendeeCount })
        .eq('id', eventId);

      if (updateError) {
        console.error('Error updating attendee count:', updateError);
        toast({
          title: "Registration Warning",
          description: "You've been registered but attendee count may not be updated. Please refresh the page.",
          variant: "destructive"
        });
      } else {
        console.log('Attendee count updated successfully:', newAttendeeCount);
      }

      toast({
        title: "Registration Successful!",
        description: `You've successfully registered for ${eventData.title}. Your QR code has been generated for attendance tracking.`,
      });

      // Refresh events list to show updated attendee count
      await fetchEvents();
      
      // Trigger a custom event that other components can listen to
      window.dispatchEvent(new CustomEvent('eventRegistrationUpdated', { 
        detail: { eventId, newAttendeeCount, userId: user.id, registration } 
      }));
      
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchUserQRCode = async (eventId: string): Promise<QRCodeData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          registration_qr_codes (
            id,
            qr_code_data,
            created_at
          )
        `)
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data && data.registration_qr_codes && data.registration_qr_codes.length > 0) {
        const qrData = data.registration_qr_codes[0];
        return {
          id: qrData.id,
          registrationId: data.id,
          qrCodeData: qrData.qr_code_data,
          createdAt: qrData.created_at,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching QR code:', error);
      return null;
    }
  };

  return {
    events,
    loading,
    createEvent,
    registerForEvent,
    refreshEvents: fetchEvents,
    fetchUserQRCode,
  };
};
