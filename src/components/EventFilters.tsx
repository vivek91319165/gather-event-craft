
import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  eventType: string;
  onEventTypeChange: (type: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({
  searchTerm,
  onSearchChange,
  eventType,
  onEventTypeChange,
  dateFilter,
  onDateFilterChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white transition-colors"
          />
        </div>

        {/* Event Type Filter */}
        <Select value={eventType} onValueChange={onEventTypeChange}>
          <SelectTrigger className="w-full lg:w-48 h-12 border-0 bg-gray-50 hover:bg-white transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Hackathon">Hackathon</SelectItem>
            <SelectItem value="Meetup">Meetup</SelectItem>
            <SelectItem value="Webinar">Webinar</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-full lg:w-48 h-12 border-0 bg-gray-50 hover:bg-white transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="When" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>

        <Button className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default EventFilters;
