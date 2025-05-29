
import React from 'react';
import { Calendar, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
            Create
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {" "}Unforgettable{" "}
            </span>
            Events
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            The ultimate platform for organizing hackathons, meetups, and webinars. 
            Connect communities, spark innovation, and make every event memorable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 px-4">
            <Button 
              size="lg" 
              onClick={() => scrollToSection('create')}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full transform hover:scale-105 transition-all"
            >
              <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Create Your Event
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => scrollToSection('events')}
              className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-gray-900 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full transform hover:scale-105 transition-all"
            >
              Explore Events
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-12 sm:pt-16 px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mb-4 mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Easy Event Creation</h3>
              <p className="text-sm sm:text-base text-gray-300">Create professional events in minutes with our intuitive interface</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mb-4 mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Community Building</h3>
              <p className="text-sm sm:text-base text-gray-300">Connect like-minded individuals and grow your community</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all">
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-sm sm:text-base text-gray-300">Track registrations and engagement with powerful insights</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
