
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useEvents } from '@/hooks/useEvents';
import { useAdmin, EventDetails } from '@/hooks/useAdmin';
import { Eye, Trash2, MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

const EventManagement = () => {
  const { events, loading } = useEvents();
  const { fetchEventDetails, deleteEvent } = useAdmin();
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const handleViewDetails = async (eventId: string) => {
    const details = await fetchEventDetails(eventId);
    if (details) {
      setSelectedEvent(details);
      setShowEventDetails(true);
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
      }
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
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

              {/* Registrations Table */}
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
                        <TableHead>User</TableHead>
                        <TableHead>Registration Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEvent.registrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell>{registration.userName}</TableCell>
                          <TableCell>
                            {format(new Date(registration.registeredAt), 'PPP p')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
};

export default EventManagement;
