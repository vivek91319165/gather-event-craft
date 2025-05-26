
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import EventForm from '@/components/EventForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { mockEvents } from '@/data/mockEvents';
import { Event, EventFormData } from '@/types/event';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = eventType === 'all' || event.eventType === eventType;
    
    // Basic date filtering (can be enhanced)
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'upcoming' && new Date(event.startDate) > new Date());
    
    return matchesSearch && matchesType && matchesDate;
  });

  const handleCreateEvent = (formData: EventFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create events.",
        variant: "destructive"
      });
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
      attendees: 0,
      createdAt: new Date().toISOString(),
      registrationEnabled: true,
    };

    setEvents(prev => [newEvent, ...prev]);
    setShowCreateForm(false);
    toast({
      title: "Event Created Successfully!",
      description: `${newEvent.title} has been created and is now live.`,
    });
  };

  const handleRegister = (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events.",
        variant: "destructive"
      });
      return;
    }

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, attendees: event.attendees + 1 }
        : event
    ));
    
    const event = events.find(e => e.id === eventId);
    toast({
      title: "Registration Successful!",
      description: `You've successfully registered for ${event?.title}`,
    });
  };

  if (showCreateForm) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <button 
                onClick={() => setShowCreateForm(false)}
                className="mb-6 text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Back to Events
              </button>
              <EventForm onSubmit={handleCreateEvent} />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Events Section */}
      <section id="events" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of developers, entrepreneurs, and innovators in events that shape the future
            </p>
          </div>

          {/* Filters */}
          <EventFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            eventType={eventType}
            onEventTypeChange={setEventType}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />

          {/* Create Event Button */}
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredEvents.length} Events Found
            </h3>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transform hover:scale-105 transition-all"
              >
                Create New Event
              </button>
            )}
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRegister={handleRegister}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or create a new event</p>
                {user && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    Create First Event
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Create Your Event?</h3>
          <p className="text-gray-400 mb-6">Join thousands of organizers using EventHub to create memorable experiences</p>
          {user ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transform hover:scale-105 transition-all"
            >
              Get Started Today
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/auth'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transform hover:scale-105 transition-all"
            >
              Sign Up to Get Started
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;
