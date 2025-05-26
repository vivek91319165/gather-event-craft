
import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EventFormData } from '@/types/event';

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    eventType: 'Meetup',
    tags: [],
    isOnline: false,
    organizerName: '',
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Create New Event</h2>
          <p className="text-purple-100">Fill in the details to create an amazing event</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Title */}
            <div className="lg:col-span-2">
              <Label htmlFor="title" className="text-lg font-semibold">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter an engaging event title"
                className="mt-2 h-12"
                required
              />
            </div>

            {/* Event Description */}
            <div className="lg:col-span-2">
              <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your event in detail..."
                className="mt-2 min-h-32"
                required
              />
            </div>

            {/* Event Type */}
            <div>
              <Label className="text-lg font-semibold">Event Type</Label>
              <Select value={formData.eventType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, eventType: value }))}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hackathon">🏆 Hackathon</SelectItem>
                  <SelectItem value="Meetup">🤝 Meetup</SelectItem>
                  <SelectItem value="Webinar">💻 Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organizer Name */}
            <div>
              <Label htmlFor="organizer" className="text-lg font-semibold">Organizer Name</Label>
              <Input
                id="organizer"
                value={formData.organizerName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizerName: e.target.value }))}
                placeholder="Your name or organization"
                className="mt-2 h-12"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="startDate" className="text-lg font-semibold">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-2 h-12"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <Label htmlFor="endDate" className="text-lg font-semibold">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-2 h-12"
                required
              />
            </div>

            {/* Online Event Toggle */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="text-lg font-semibold">Event Location</Label>
                  <p className="text-sm text-gray-600">Choose if this is an online or in-person event</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="online-toggle" className="text-sm">Online Event</Label>
                  <Switch
                    id="online-toggle"
                    checked={formData.isOnline}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOnline: checked }))}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="lg:col-span-2">
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder={formData.isOnline ? "Meeting link or platform" : "Venue address"}
                className="h-12"
                required
              />
            </div>

            {/* Max Attendees */}
            <div>
              <Label htmlFor="maxAttendees" className="text-lg font-semibold">Max Attendees (Optional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                value={formData.maxAttendees || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Leave empty for unlimited"
                className="mt-2 h-12"
                min="1"
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-lg font-semibold">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="h-12"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline" className="h-12 px-4">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:bg-purple-200 transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <span className="text-purple-500 hover:text-purple-700">×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" className="px-8">
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
