import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEvents } from '@/hooks/useEvents';
import { useAdmin, EventDetails } from '@/hooks/useAdmin';
import { Eye, Trash2, MapPin, Calendar, Users, UserX, User, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import QRScanner from './QRScanner';

interface UserRegistration {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  isBlocked: boolean;
}

const EventManagement = () => {
  const { events, loading, refreshEvents } = useEvents();
  const { fetchEventDetails, deleteEvent, blockUser, unblockUser, getEventAttendance } = useAdmin();
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [userToBlock, setUserToBlock] = useState<{ userId: string; userName: string } | null>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  // Listen for registration updates
  useEffect(() => {
    const handleRegistrationUpdate = (event: CustomEvent) => {
      console.log('Registration update received in admin panel:', event.detail);
      
      // Refresh events to get updated attendee counts
      refreshEvents();
      
      // If the admin panel is open for this event, refresh its details
      if (selectedEvent && selectedEvent.id === event.detail.eventId) {
        console.log('Refreshing selected event details...');
        handleViewDetails(selectedEvent.id);
      }
    };

    window.addEventListener('eventRegistrationUpdated', handleRegistrationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('eventRegistrationUpdated', handleRegistrationUpdate as EventListener);
    };
  }, [selectedEvent, refreshEvents]);

  const handleViewDetails = async (eventId: string) => {
    console.log('Fetching event details for:', eventId);
    const details = await fetchEventDetails(eventId);
    if (details) {
      console.log('Event details fetched:', details);
      setSelectedEvent(details);
      
      // Fetch attendance data
      const attendance = await getEventAttendance(eventId);
      setAttendanceData(attendance);
      
      setShowEventDetails(true);
    }
  };

  const handleAttendanceMarked = async () => {
    if (selectedEvent) {
      // Refresh attendance data
      const attendance = await getEventAttendance(selectedEvent.id);
      setAttendanceData(attendance);
      
      // Also refresh the event details to get updated registration count
      await handleViewDetails(selectedEvent.id);
    }
  };

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete && deleteReason.trim()) {
      const success = await deleteEvent(eventToDelete, deleteReason);
      if (success) {
        setShowDeleteDialog(false);
        setDeleteReason('');
        setEventToDelete(null);
        // Refresh events list
        await refreshEvents();
      }
    }
  };

  const handleBlockClick = (userId: string, userName: string) => {
    setUserToBlock({ userId, userName });
    setShowBlockDialog(true);
  };

  const handleBlockConfirm = async () => {
    if (userToBlock && blockReason.trim()) {
      const success = await blockUser(userToBlock.userId, blockReason);
      if (success) {
        setShowBlockDialog(false);
        setBlockReason('');
        setUserToBlock(null);
        // Refresh the event details to update block status
        if (selectedEvent) {
          handleViewDetails(selectedEvent.id);
        }
      }
    }
  };

  const handleUnblock = async (userId: string) => {
    const success = await unblockUser(userId);
    if (success && selectedEvent) {
      // Refresh the event details to update block status
      handleViewDetails(selectedEvent.id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.isOnline ? 'Online' : event.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{event.organizerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.eventType}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(event.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        {event.attendees}
                        {event.maxAttendees && `/${event.maxAttendees}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={new Date(event.startDate) > new Date() ? "default" : "secondary"}
                      >
                        {new Date(event.startDate) > new Date() ? 'Upcoming' : 'Past'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(event.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="registrations">
                  Registrations ({selectedEvent.registrations.length})
                </TabsTrigger>
                <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p className="text-sm">{selectedEvent.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-sm">{selectedEvent.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <Badge variant="outline">{selectedEvent.eventType}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date & Time</p>
                        <p className="text-sm">
                          {format(new Date(selectedEvent.startDate), 'PPP p')} - 
                          {format(new Date(selectedEvent.endDate), 'PPP p')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Organizer & Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Organizer</p>
                        <p className="text-sm">{selectedEvent.organizerName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Current Attendees</p>
                        <p className="text-sm">{selectedEvent.attendees}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Max Attendees</p>
                        <p className="text-sm">{selectedEvent.maxAttendees || 'Unlimited'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Registration Status</p>
                        <Badge variant="default">Open</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="registrations">
                {/* Registered Users Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Registered Users ({selectedEvent.registrations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEvent.registrations.map((registration) => (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">
                              {registration.userName}
                            </TableCell>
                            <TableCell>{registration.userEmail}</TableCell>
                            <TableCell>
                              {format(new Date(registration.registeredAt), 'PPP p')}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={registration.isBlocked ? "destructive" : "default"}
                              >
                                {registration.isBlocked ? "Blocked" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {registration.isBlocked ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUnblock(registration.userId)}
                                  >
                                    <User className="h-4 w-4 mr-1" />
                                    Unblock
                                  </Button>
                                ) : (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleBlockClick(registration.userId, registration.userName)}
                                  >
                                    <UserX className="h-4 w-4 mr-1" />
                                    Block
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {selectedEvent.registrations.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No users registered for this event yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scanner">
                <QRScanner 
                  eventId={selectedEvent.id} 
                  onAttendanceMarked={handleAttendanceMarked}
                />
              </TabsContent>

              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Attendance Records ({attendanceData.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Name</TableHead>
                          <TableHead>Check-in Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {record.userName}
                            </TableCell>
                            <TableCell>
                              {format(new Date(record.checkedInAt), 'PPP p')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {attendanceData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                              No attendance records yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Event Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Reason for deletion (required)
              </label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deleting this event..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={!deleteReason.trim()}
              >
                Delete Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block User Confirmation Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to block <span className="font-medium">{userToBlock?.userName}</span>? 
              This will prevent them from accessing the platform.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Reason for blocking (required)
              </label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this user..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBlockDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBlockConfirm}
                disabled={!blockReason.trim()}
              >
                Block User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventManagement;
