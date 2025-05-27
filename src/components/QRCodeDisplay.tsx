
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import { useEvents, QRCodeData } from '@/hooks/useEvents';

interface QRCodeDisplayProps {
  eventId: string;
  eventTitle: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ eventId, eventTitle }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserQRCode } = useEvents();

  useEffect(() => {
    const loadQRCode = async () => {
      try {
        const data = await fetchUserQRCode(eventId);
        if (data) {
          setQrData(data);
          // Generate QR code image
          const qrCodeDataUrl = await QRCode.toDataURL(data.qrCodeData, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeUrl(qrCodeDataUrl);
        }
      } catch (error) {
        console.error('Error loading QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQRCode();
  }, [eventId, fetchUserQRCode]);

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${eventTitle}-qr-code.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!qrData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">QR code not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your Event QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {qrCodeUrl && (
          <>
            <img 
              src={qrCodeUrl} 
              alt="Event QR Code" 
              className="mx-auto border rounded-lg"
            />
            <p className="text-sm text-gray-600">
              Show this QR code at the event entrance for attendance tracking
            </p>
            <Button 
              onClick={downloadQRCode} 
              variant="outline" 
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
