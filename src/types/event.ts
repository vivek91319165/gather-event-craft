
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  eventType: 'Hackathon' | 'Meetup' | 'Webinar';
  image?: string;
  tags: string[];
  attendees: number;
  maxAttendees?: number;
  isOnline: boolean;
  createdAt: string;
  organizerName: string;
  registrationEnabled: boolean;
  isFree: boolean;
  price?: number;
  currency: string;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  eventType: 'Hackathon' | 'Meetup' | 'Webinar';
  tags: string[];
  maxAttendees?: number;
  isOnline: boolean;
  organizerName: string;
  isFree: boolean;
  price?: number;
  currency: string;
}
