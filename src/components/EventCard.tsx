
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Event } from '@/types/event';
import { useAuth } from '@/contexts/AuthContext';
import QRCodeDisplay from './QRCodeDisplay';

interface EventCardProps {
  event: Event;
  onRegister: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister }) => {
  const { user } = useAuth();
  const [showQRCode, setShowQRCode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Check if user is registered (this would need to be implemented properly)
  React.useEffect(() => {
    // This is a simplified check - in a real app, you'd fetch this data
    // For now, we'll assume the user can see their QR code if they click the button
  }, [event.id, user]);

  const handleRegister = () => {
    onRegister(event.id);
    setIsRegistered(true);
  };

  const isEventPast = new Date(event.startDate) < new Date();
  const isEventFull = event.maxAttendees && event.attendees >= event.maxAttendees;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {event.image && (
          <div className="h-48 overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="text-xs">
              {event.eventType}
            </Badge>
            <div className="flex gap-1">
              <Badge 
                variant={isEventPast ? "secondary" : "default"}
                className="text-xs"
              >
                {isEventPast ? 'Past' : 'Upcoming'}
              </Badge>
              {isEventFull && (
                <Badge variant="destructive" className="text-xs">
                  Full
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
            {event.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
            {event.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(event.startDate), 'PPP p')}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              {event.isOnline ? 'Online Event' : event.location}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              {event.attendees} attendees
              {event.maxAttendees && ` / ${event.maxAttendees} max`}
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              Organized by {event.organizerName}
            </div>
          </div>

          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {event.tags.slice(0, 3).map((tag, index) => (
                <div key={index} className="flex items-center text-xs text-gray-500">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </div>
              ))}
              {event.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{event.tags.length - 3} more</span>
              )}
            </div>
          )}

          <div className="mt-auto space-y-2">
            {user && event.registrationEnabled && !isEventPast && !isEventFull && (
              <Button 
                onClick={handleRegister}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Register Now
              </Button>
            )}
            
            {user && event.registrationEnabled && !isEventPast && isEventFull && (
              <Button 
                disabled
                className="w-full"
              >
                Event Full
              </Button>
            )}
            
            {user && (
              <Button 
                onClick={() => setShowQRCode(true)}
                variant="outline" 
                className="w-full"
              >
                View My QR Code
              </Button>
            )}
            
            {!user && (
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline" 
                className="w-full"
              >
                Sign in to Register
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{event.title} - QR Code</DialogTitle>
          </DialogHeader>
          <QRCodeDisplay eventId={event.id} eventTitle={event.title} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
