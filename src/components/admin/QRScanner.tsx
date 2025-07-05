// src/components/admin/QRScanner.tsx
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  isActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  title?: string;
  pauseDuration?: number; // Duration to pause scanner after successful scan (ms)
  showSettings?: boolean;
  qrBoxSize?: { width: number; height: number };
}

export function QRScanner({
  onScan,
  onError,
  isActive = false,
  onActiveChange,
  title = "QR Code Scanner",
  pauseDuration = 2000,
  showSettings = true,
  qrBoxSize = { width: 280, height: 280 }
}: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [scannerSettings] = useState({
    fps: 10,
    showTorch: true,
    showZoom: true,
    defaultZoom: 2
  });

  const initializeScanner = useCallback(() => {
    if (scannerRef.current || !containerRef.current) return;

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-reader-container", 
        { 
          fps: scannerSettings.fps,
          qrbox: qrBoxSize,
          showTorchButtonIfSupported: scannerSettings.showTorch,
          showZoomSliderIfSupported: scannerSettings.showZoom,
          defaultZoomValueIfSupported: scannerSettings.defaultZoom,
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current = scanner;

      const onScanSuccess = (decodedText: string) => {
        // Pause scanner to prevent rapid duplicate scans
        scanner.pause(true);
        onScan(decodedText);
        
        // Resume after specified duration
        if (pauseDuration > 0) {
          setTimeout(() => {
            if (scannerRef.current && isActive) {
              scanner.resume();
            }
          }, pauseDuration);
        }
      };
      
      const onScanFailure = (error: string) => {
        // Only log persistent errors, not common scan failures
        if (error.includes('NotFoundException') === false) {
          onError?.(error);
        }
      };

      scanner.render(onScanSuccess, onScanFailure);
      setIsScannerReady(true);
      onActiveChange?.(true);
      
    } catch (error) {
      console.error("Failed to initialize QR scanner:", error);
      toast.error("Failed to initialize camera scanner");
      onError?.(error instanceof Error ? error.message : 'Scanner initialization failed');
    }
  }, [onScan, onError, onActiveChange, isActive, pauseDuration, qrBoxSize, scannerSettings]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
      setIsScannerReady(false);
      onActiveChange?.(false);
    }
  }, [onActiveChange]);

  const toggleScanner = () => {
    if (isActive && scannerRef.current) {
      stopScanner();
    } else {
      initializeScanner();
    }
  };

  // Initialize scanner when component mounts if isActive is true
  useEffect(() => {
    if (isActive && !scannerRef.current) {
      const timer = setTimeout(initializeScanner, 100);
      return () => clearTimeout(timer);
    } else if (!isActive && scannerRef.current) {
      stopScanner();
    }
  }, [isActive, initializeScanner, stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {title}
        </CardTitle>
        <div className="flex gap-2">
          {showSettings && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={toggleScanner}
          >
            {isActive ? (
              <>
                <CameraOff className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          id="qr-reader-container" 
          className={`w-full ${!isActive ? 'hidden' : ''}`}
        />
        {!isActive && (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium">Camera Scanner Stopped</p>
              <p className="text-sm text-gray-400 mt-1">
                Click &quot;Start&quot; to begin scanning QR codes
              </p>
            </div>
          </div>
        )}
        {isActive && !isScannerReady && (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Initializing camera...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
