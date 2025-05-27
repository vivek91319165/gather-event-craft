
import React from 'react';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const Admin = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <AdminDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
