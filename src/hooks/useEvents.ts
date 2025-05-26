
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Event, EventFormData } from '@/types/event';
import { toast } from '@/hooks/use-toast';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:organizer_id (
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedEvents: Event[] = data.map(event => ({
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
        organizerName: event.profiles?.full_name || event.profiles?.username || 'Unknown Organizer',
        registrationEnabled: event.registration_enabled || true,
      }));

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
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) throw error;

      // Update attendee count
      const { error: updateError } = await supabase
        .from('events')
        .update({ attendees: supabase.sql`attendees + 1` })
        .eq('id', eventId);

      if (updateError) throw updateError;

      const event = events.find(e => e.id === eventId);
      toast({
        title: "Registration Successful!",
        description: `You've successfully registered for ${event?.title}`,
      });

      // Refresh events list
      await fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event. You might already be registered.",
        variant: "destructive"
      });
    }
  };

  return {
    events,
    loading,
    createEvent,
    registerForEvent,
    refreshEvents: fetchEvents,
  };
};
