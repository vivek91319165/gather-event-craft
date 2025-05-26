
import React from 'react';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Hackathon': return 'bg-purple-500';
      case 'Meetup': return 'bg-blue-500';
      case 'Webinar': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-500 overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-16 w-16 text-white opacity-80" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge className={`${getEventTypeColor(event.eventType)} text-white border-0`}>
            {event.eventType}
          </Badge>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {event.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{event.isOnline ? 'Online Event' : event.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            <span>{event.attendees} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attendees</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => onRegister?.(event.id)}
            disabled={!event.registrationEnabled}
          >
            {event.registrationEnabled ? 'Register Now' : 'Registration Closed'}
          </Button>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
