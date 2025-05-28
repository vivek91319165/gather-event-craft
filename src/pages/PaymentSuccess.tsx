
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Thank you for your payment. Your event registration has been confirmed.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700">
            You will receive a confirmation email shortly with your event details and QR code for attendance.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/">
              <Calendar className="h-4 w-4 mr-2" />
              View My Events
            </Link>
          </Button>
        </div>

        {sessionId && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Payment ID: {sessionId.slice(-8)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
