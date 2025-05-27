
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalRegistrations: number;
  blockedUsers: number;
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  eventType: string;
  attendees: number;
  maxAttendees?: number;
  organizerName: string;
  organizerId: string;
  registrations: UserRegistration[];
}

export interface UserRegistration {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  isBlocked: boolean;
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const adminStatus = data?.role === 'admin';
      setIsAdmin(adminStatus);

      if (adminStatus) {
        await fetchAdminStats();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      // Fetch total events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total registrations
      const { count: registrationsCount } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true });

      // Fetch blocked users count
      const { count: blockedCount } = await supabase
        .from('blocked_users')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalEvents: eventsCount || 0,
        totalUsers: usersCount || 0,
        totalRegistrations: registrationsCount || 0,
        blockedUsers: blockedCount || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchEventDetails = async (eventId: string): Promise<EventDetails | null> => {
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Fetch organizer info
      const { data: organizerData, error: organizerError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', eventData.organizer_id)
        .single();

      if (organizerError) throw organizerError;

      // Fetch registrations with detailed user information including email and blocked status
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          user_id,
          registered_at,
          profiles!inner(
            full_name, 
            username, 
            is_blocked
          )
        `)
        .eq('event_id', eventId);

      if (registrationsError) throw registrationsError;

      // Fetch user emails from auth metadata (we'll get them from profiles if available)
      const userIds = registrationsData.map(reg => reg.user_id);
      const { data: userProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, is_blocked')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const registrations: UserRegistration[] = registrationsData.map(reg => {
        const profile = userProfiles.find(p => p.id === reg.user_id);
        return {
          id: reg.id,
          userId: reg.user_id,
          userName: profile?.full_name || profile?.username || 'Unknown User',
          userEmail: `${profile?.username || 'user'}@example.com`, // Placeholder since we can't access auth.users
          registeredAt: reg.registered_at,
          isBlocked: profile?.is_blocked || false,
        };
      });

      return {
        id: eventData.id,
        title: eventData.title,
        description: eventData.description || '',
        startDate: eventData.start_date,
        endDate: eventData.end_date,
        location: eventData.location || '',
        eventType: eventData.event_type,
        attendees: eventData.attendees || 0,
        maxAttendees: eventData.max_attendees,
        organizerName: organizerData?.full_name || organizerData?.username || 'Unknown Organizer',
        organizerId: eventData.organizer_id,
        registrations,
      };
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  };

  const blockUser = async (userId: string, reason: string) => {
    if (!user || !isAdmin) return false;

    try {
      // Insert into blocked_users table
      const { error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          user_id: userId,
          blocked_by: user.id,
          reason,
        });

      if (blockError) throw blockError;

      // Log admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: 'block_user',
          target_user_id: userId,
          reason,
        });

      if (actionError) throw actionError;

      toast({
        title: "User Blocked",
        description: "User has been successfully blocked.",
      });

      await fetchAdminStats(); // Refresh stats
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const unblockUser = async (userId: string) => {
    if (!user || !isAdmin) return false;

    try {
      // Remove from blocked_users table
      const { error: unblockError } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', userId);

      if (unblockError) throw unblockError;

      // Log admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: 'unblock_user',
          target_user_id: userId,
        });

      if (actionError) throw actionError;

      toast({
        title: "User Unblocked",
        description: "User has been successfully unblocked.",
      });

      await fetchAdminStats(); // Refresh stats
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const fetchBlockedUsers = async (): Promise<BlockedUser[]> => {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          user_id,
          reason,
          blocked_at,
          blocked_by,
          profiles!blocked_users_user_id_fkey(full_name, username)
        `)
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        userName: (item.profiles as any)?.full_name || (item.profiles as any)?.username || 'Unknown User',
        userEmail: 'N/A',
        reason: item.reason || 'No reason provided',
        blockedAt: item.blocked_at,
        blockedBy: item.blocked_by,
      }));
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  };

  const deleteEvent = async (eventId: string, reason: string) => {
    if (!user || !isAdmin) return false;

    try {
      // Delete event registrations first
      const { error: registrationsError } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId);

      if (registrationsError) throw registrationsError;

      // Delete the event
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (eventError) throw eventError;

      // Log admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: 'delete_event',
          target_event_id: eventId,
          reason,
        });

      if (actionError) throw actionError;

      toast({
        title: "Event Deleted",
        description: "Event has been successfully deleted.",
      });

      await fetchAdminStats(); // Refresh stats
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isAdmin,
    loading,
    stats,
    fetchEventDetails,
    blockUser,
    unblockUser,
    fetchBlockedUsers,
    deleteEvent,
    refreshStats: fetchAdminStats,
  };
};
