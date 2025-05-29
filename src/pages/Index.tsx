
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import EventForm from '@/components/EventForm';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEvents } from '@/hooks/useEvents';
import { EventFormData } from '@/types/event';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { events, loading, createEvent, registerForEvent } = useEvents();
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

  const handleCreateEvent = async (formData: EventFormData) => {
    const success = await createEvent(formData);
    if (success) {
      setShowCreateForm(false);
    }
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Events
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : `${filteredEvents.length} Events Found`}
            </h3>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transform hover:scale-105 transition-all text-center"
              >
                Create New Event
              </button>
            )}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRegister={registerForEvent}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Try adjusting your filters or create a new event</p>
                {user && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    Create First Event
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Create Event Section */}
      <section id="create" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ready to Create Your Event?</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">Join thousands of organizers using EventHub to create memorable experiences</p>
          {user ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transform hover:scale-105 transition-all"
            >
              Get Started Today
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/auth'}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transform hover:scale-105 transition-all"
            >
              Sign Up to Get Started
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to Create Your Event?</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-6">Join thousands of organizers using EventHub to create memorable experiences</p>
          {user ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transform hover:scale-105 transition-all"
            >
              Get Started Today
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/auth'}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transform hover:scale-105 transition-all"
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
