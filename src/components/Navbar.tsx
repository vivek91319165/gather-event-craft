
import React from 'react';
import { Calendar, Plus, Search, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              EventHub
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#events" className="text-gray-700 hover:text-purple-600 transition-colors">
              Events
            </a>
            {user && (
              <a href="#create" className="text-gray-700 hover:text-purple-600 transition-colors">
                Create Event
              </a>
            )}
            {user && (
              <button 
                onClick={handleAdminClick}
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                Admin
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            
            {user ? (
              <>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAdminClick}>
                  <Shield className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleAuthClick} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
