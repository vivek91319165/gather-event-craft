
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/hooks/useAdmin';
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';

const AdminStats = () => {
  const { stats } = useAdmin();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats?.totalEvents || 0}</p>
              <p className="text-sm text-blue-600">Total Events</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-green-600">Registered Users</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats?.totalRegistrations || 0}</p>
              <p className="text-sm text-purple-600">Event Registrations</p>
            </div>
            
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats?.blockedUsers || 0}</p>
              <p className="text-sm text-red-600">Blocked Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Events</span>
                <span className="font-medium">{stats?.totalEvents || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Registrations</span>
                <span className="font-medium">{stats?.totalRegistrations || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average per Event</span>
                <span className="font-medium">
                  {stats?.totalEvents ? 
                    Math.round((stats.totalRegistrations || 0) / stats.totalEvents) : 
                    0
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-medium">{stats?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-medium">
                  {(stats?.totalUsers || 0) - (stats?.blockedUsers || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blocked Users</span>
                <span className="font-medium text-red-600">{stats?.blockedUsers || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
