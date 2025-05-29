
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';

interface QRScannerProps {
  eventId: string;
  onAttendanceMarked?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ eventId, onAttendanceMarked }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scannedUserName, setScannedUserName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { markAttendance } = useAdmin();

  // Cooldown period in milliseconds (3 seconds)
  const SCAN_COOLDOWN = 3000;

  useEffect(() => {
    return () => {
      if (qrScanner) {
        qrScanner.destroy();
      }
    };
  }, [qrScanner]);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          const now = Date.now();
          
          // Check if we're already processing or if this is a duplicate scan within cooldown period
          if (isProcessing || 
              (result.data === lastScanResult && (now - lastScanTime) < SCAN_COOLDOWN)) {
            return;
          }

          setLastScanResult(result.data);
          setLastScanTime(now);
          await handleScanResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scanner.start();
      setQrScanner(scanner);
      setIsScanning(true);
      setScanStatus('idle');
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: "Scanner Error",
        description: "Failed to start camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    setIsScanning(false);
    setScanStatus('idle');
    setScannedUserName('');
    setIsProcessing(false);
  };

  const handleScanResult = async (qrCodeData: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const result = await markAttendance(eventId, qrCodeData);
      if (result.success) {
        setScanStatus('success');
        setScannedUserName(result.userName || 'Unknown User');
        toast({
          title: "Attendance Marked",
          description: `${result.userName || 'User'} attendance has been successfully recorded.`,
        });
        onAttendanceMarked?.();
        
        // Show success popup for longer
        setTimeout(() => {
          setScanStatus('idle');
          setScannedUserName('');
          setIsProcessing(false);
        }, 3000);
      } else {
        setScanStatus('error');
        setIsProcessing(false);
        setTimeout(() => setScanStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setScanStatus('error');
      setIsProcessing(false);
      setTimeout(() => setScanStatus('idle'), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          QR Code Scanner
          {scanStatus === 'success' && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Success
            </Badge>
          )}
          {scanStatus === 'error' && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary">
              Processing...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg border"
            style={{ aspectRatio: '1/1' }}
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to start scanning</p>
              </div>
            </div>
          )}
          
          {/* Success Popup Overlay */}
          {scanStatus === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90 rounded-lg">
              <div className="text-center text-white">
                <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Attendance Marked!</h3>
                <p className="text-lg">{scannedUserName}</p>
                <p className="text-sm mt-2">Successfully checked in</p>
              </div>
            </div>
          )}
          
          {/* Error Popup Overlay */}
          {scanStatus === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-90 rounded-lg">
              <div className="text-center text-white">
                <XCircle className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Scan Failed</h3>
                <p className="text-sm">Please try again</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          {!isScanning ? (
            <Button onClick={startScanning} className="w-full max-w-xs">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanner
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="w-full max-w-xs">
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanner
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-gray-600">
          Position the QR code within the camera frame to mark attendance
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;
