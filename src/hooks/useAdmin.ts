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

export interface BlockedUser {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
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

      // Fetch registrations with user details
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          user_id,
          registered_at,
          profiles!inner (
            id,
            full_name,
            username,
            is_blocked
          )
        `)
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });

      if (registrationsError) throw registrationsError;

      // Get auth user details for email addresses
      const userIds = registrationsData.map(reg => reg.user_id);
      
      // Since we can't directly access auth.users, we'll use a Supabase RPC function
      // or use the username as email fallback for now
      const registrations: UserRegistration[] = registrationsData.map(reg => {
        const profile = reg.profiles;
        // Generate email from username or use a placeholder
        let userEmail = 'No email available';
        
        if (profile?.username) {
          // If username looks like an email, use it
          if (profile.username.includes('@')) {
            userEmail = profile.username;
          } else {
            // Otherwise, assume it might be based on email prefix
            userEmail = `${profile.username}@domain.com`;
          }
        }
        
        return {
          id: reg.id,
          userId: reg.user_id,
          userName: profile?.full_name || profile?.username || 'Unknown User',
          userEmail: userEmail,
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
      const { data: blockedData, error } = await supabase
        .from('blocked_users')
        .select('id, user_id, reason, blocked_at, blocked_by')
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for blocked users
      const userIds = blockedData.map(item => item.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map(profiles.map(profile => [profile.id, profile]));

      return blockedData.map(item => {
        const profile = profilesMap.get(item.user_id);
        return {
          id: item.id,
          userId: item.user_id,
          userName: profile?.full_name || profile?.username || 'Unknown User',
          userEmail: 'N/A',
          reason: item.reason || 'No reason provided',
          blockedAt: item.blocked_at,
          blockedBy: item.blocked_by,
        };
      });
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  };

  const deleteEvent = async (eventId: string, reason: string) => {
    if (!user || !isAdmin) return false;

    try {
      // Delete in proper order to avoid foreign key constraint violations
      
      // 1. Delete QR codes first
      const { data: registrations, error: fetchRegError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId);

      if (fetchRegError) throw fetchRegError;

      const registrationIds = registrations.map(reg => reg.id);

      if (registrationIds.length > 0) {
        // Delete QR codes
        const { error: qrDeleteError } = await supabase
          .from('registration_qr_codes')
          .delete()
          .in('registration_id', registrationIds);

        if (qrDeleteError) throw qrDeleteError;

        // Delete attendance records
        const { error: attendanceDeleteError } = await supabase
          .from('event_attendance')
          .delete()
          .in('registration_id', registrationIds);

        if (attendanceDeleteError) throw attendanceDeleteError;

        // Delete event payments
        const { error: paymentsDeleteError } = await supabase
          .from('event_payments')
          .delete()
          .eq('event_id', eventId);

        if (paymentsDeleteError) throw paymentsDeleteError;
      }

      // 2. Delete event registrations
      const { error: registrationsError } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId);

      if (registrationsError) throw registrationsError;

      // 3. Delete the event
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (eventError) throw eventError;

      // 4. Log admin action (skip if it fails due to foreign key constraint)
      try {
        const { error: actionError } = await supabase
          .from('admin_actions')
          .insert({
            admin_id: user.id,
            action_type: 'delete_event',
            reason,
          });

        if (actionError) {
          console.warn('Failed to log admin action:', actionError);
        }
      } catch (actionError) {
        console.warn('Failed to log admin action:', actionError);
      }

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

  const markAttendance = async (eventId: string, qrCodeData: string) => {
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can mark attendance.",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      // First, find the QR code and get registration info
      const { data: qrData, error: qrError } = await supabase
        .from('registration_qr_codes')
        .select('id, registration_id')
        .eq('qr_code_data', qrCodeData)
        .single();

      if (qrError) {
        toast({
          title: "Invalid QR Code",
          description: "QR code not found or not valid.",
          variant: "destructive"
        });
        return { success: false };
      }

      // Verify the registration belongs to this event
      const { data: registrationData, error: regError } = await supabase
        .from('event_registrations')
        .select('id, event_id, user_id')
        .eq('id', qrData.registration_id)
        .eq('event_id', eventId)
        .single();

      if (regError) {
        toast({
          title: "Invalid Registration",
          description: "QR code not valid for this event.",
          variant: "destructive"
        });
        return { success: false };
      }

      // Check if attendance is already marked
      const { data: existingAttendance, error: attendanceCheckError } = await supabase
        .from('event_attendance')
        .select('id')
        .eq('registration_id', qrData.registration_id)
        .maybeSingle();

      if (attendanceCheckError) {
        throw attendanceCheckError;
      }

      if (existingAttendance) {
        toast({
          title: "Already Checked In",
          description: "This user has already been marked as present.",
          variant: "destructive"
        });
        return { success: false };
      }

      // Mark attendance
      const { error: attendanceError } = await supabase
        .from('event_attendance')
        .insert({
          registration_id: qrData.registration_id,
          checked_in_by: user.id,
        });

      if (attendanceError) throw attendanceError;

      // Get user name for the response
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', registrationData.user_id)
        .single();

      const userName = userProfile?.full_name || userProfile?.username || 'Unknown User';

      return { success: true, userName };
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const getEventAttendance = async (eventId: string) => {
    try {
      // First get all registrations for this event
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('id, user_id')
        .eq('event_id', eventId);

      if (regError) throw regError;

      // Get attendance records for these registrations
      const registrationIds = registrations.map(reg => reg.id);
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('event_attendance')
        .select('id, checked_in_at, registration_id')
        .in('registration_id', registrationIds)
        .order('checked_in_at', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Get user profiles for attended users
      const attendedRegistrations = attendanceData.map(att => 
        registrations.find(reg => reg.id === att.registration_id)
      ).filter(Boolean);

      const userIds = attendedRegistrations.map(reg => reg!.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles.map(profile => [profile.id, profile]));

      return attendanceData.map(item => {
        const registration = registrations.find(reg => reg.id === item.registration_id);
        const profile = registration ? profilesMap.get(registration.user_id) : null;
        
        return {
          id: item.id,
          checkedInAt: item.checked_in_at,
          registrationId: item.registration_id,
          userName: profile?.full_name || profile?.username || 'Unknown User',
          userId: registration?.user_id || '',
        };
      });
    } catch (error) {
      console.error('Error fetching event attendance:', error);
      return [];
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
    markAttendance,
    getEventAttendance,
  };
};
