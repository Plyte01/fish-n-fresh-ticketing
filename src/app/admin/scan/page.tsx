// src/app/admin/scan/page.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TicketCheck,
  Clock,
  BarChart3,
  Upload
} from 'lucide-react';
import { Ticket, Event } from '@prisma/client';
import { QRScanner } from '@/components/admin/QRScanner';
import { ScanDashboard } from '@/components/admin/ScanDashboard';

type ValidationResult = {
  status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID';
  message: string;
  ticket?: Ticket & { event: Event };
  timestamp?: string;
};

type ScanStats = {
  totalScanned: number;
  successfulCheckins: number;
  duplicateAttempts: number;
  invalidTickets: number;
  recentScans: ValidationResult[];
};

export default function UniversalScanPage() {
  const [manualCode, setManualCode] = useState('');
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [scanStats, setScanStats] = useState<ScanStats>({
    totalScanned: 0,
    successfulCheckins: 0,
    duplicateAttempts: 0,
    invalidTickets: 0,
    recentScans: []
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [bulkCodes, setBulkCodes] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // Audio feedback
  const playSound = useCallback((type: 'success' | 'error' | 'warning') => {
    try {
      const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const frequencies = { success: 800, error: 300, warning: 600 };
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(frequencies[type], context.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.2);
    } catch {
      // Audio context might not be available
    }
  }, []);

  const updateStats = useCallback((result: ValidationResult) => {
    setScanStats(prev => {
      const newStats = { ...prev };
      newStats.totalScanned += 1;
      
      switch (result.status) {
        case 'SUCCESS':
          newStats.successfulCheckins += 1;
          break;
        case 'ALREADY_CHECKED_IN':
          newStats.duplicateAttempts += 1;
          break;
        case 'INVALID':
          newStats.invalidTickets += 1;
          break;
      }
      
      // Add to recent scans (keep last 10)
      newStats.recentScans = [
        { ...result, timestamp: new Date().toISOString() },
        ...prev.recentScans.slice(0, 9)
      ];
      
      return newStats;
    });
  }, []);

  const handleValidation = async (ticketCode: string) => {
    if (!ticketCode.trim()) return;

    try {
      const response = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: ticketCode.trim().toUpperCase() }),
      });
      
      const result: ValidationResult = await response.json();
      setLastResult(result);
      updateStats(result);
      
      // Provide feedback
      switch (result.status) {
        case 'SUCCESS':
          toast.success(result.message);
          playSound('success');
          break;
        case 'ALREADY_CHECKED_IN':
          toast.warning(result.message);
          playSound('warning');
          break;
        case 'INVALID':
          toast.error(result.message);
          playSound('error');
          break;
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error("Network error during validation");
      playSound('error');
    } finally {
      setManualCode('');
      // Focus back to manual input for quick successive scans
      if (manualInputRef.current) {
        manualInputRef.current.focus();
      }
    }
  };

  const handleBulkValidation = async () => {
    if (!bulkCodes.trim()) return;
    
    const codes = bulkCodes
      .split('\n')
      .map(code => code.trim())
      .filter(code => code.length > 0);
    
    if (codes.length === 0) {
      toast.error('No valid ticket codes found');
      return;
    }

    if (codes.length > 50) {
      toast.error('Maximum 50 tickets can be processed at once');
      return;
    }

    setIsBulkProcessing(true);
    try {
      const response = await fetch('/api/tickets/bulk-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCodes: codes }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(
          `Bulk processing complete: ${data.summary.successful} successful, ${data.summary.failed} failed`
        );
        
        // Update stats with bulk results
        setScanStats(prev => ({
          ...prev,
          totalScanned: prev.totalScanned + data.summary.total,
          successfulCheckins: prev.successfulCheckins + data.summary.successful,
          duplicateAttempts: prev.duplicateAttempts + data.summary.alreadyUsed,
          invalidTickets: prev.invalidTickets + data.summary.invalid,
        }));
        
        setBulkCodes('');
      } else {
        toast.error(data.error || 'Bulk processing failed');
      }
    } catch (error) {
      console.error('Bulk validation error:', error);
      toast.error('Network error during bulk processing');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleValidation(manualCode);
    }
  };

  const ResultCard = ({ result }: { result: ValidationResult }) => {
    if (!result) return null;
    
    const configs = {
      SUCCESS: {
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-800',
        icon: CheckCircle2,
        iconColor: 'text-green-600'
      },
      ALREADY_CHECKED_IN: {
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-800',
        icon: AlertTriangle,
        iconColor: 'text-yellow-600'
      },
      INVALID: {
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
    };
    
    const config = configs[result.status];
    const Icon = config.icon;

    return (
      <Card className={`${config.bgColor} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
            <CardTitle className={`text-lg ${config.textColor}`}>
              {result.message}
            </CardTitle>
          </div>
        </CardHeader>
        {result.ticket && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Event:</span>
                <p className={config.textColor}>{result.ticket.event.name}</p>
              </div>
              <div>
                <span className="font-medium">Ticket Code:</span>
                <p className={`font-mono ${config.textColor}`}>{result.ticket.ticketCode}</p>
              </div>
              <div>
                <span className="font-medium">Contact:</span>
                <p className={config.textColor}>{result.ticket.email || result.ticket.phone}</p>
              </div>
              <div>
                <span className="font-medium">Venue:</span>
                <p className={config.textColor}>{result.ticket.event.venue}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Ticket Scanner</h1>
        <p className="text-muted-foreground">
          Scan QR codes, enter tickets manually, or process tickets in bulk for event check-in
        </p>
      </div>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Processing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Section */}
            <div className="space-y-4">
              {/* QR Scanner */}
              <QRScanner
                onScan={handleValidation}
                isActive={isCameraActive}
                onActiveChange={setIsCameraActive}
                title="QR Code Scanner"
                pauseDuration={2000}
              />
              
              {/* Manual Entry */}
              <Card>
                <CardHeader>
                  <CardTitle>Manual Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <Input 
                      ref={manualInputRef}
                      placeholder="Enter ticket code..." 
                      value={manualCode} 
                      onChange={e => setManualCode(e.target.value.toUpperCase())}
                      className="font-mono"
                      autoComplete="off"
                    />
                    <Button type="submit" disabled={!manualCode.trim()}>
                      <TicketCheck className="h-4 w-4 mr-2" />
                      Validate
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: Use Tab or Enter to quickly validate tickets
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Results and Recent Activity */}
            <div className="space-y-4">
              {/* Latest Result */}
              {lastResult && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Latest Scan Result
                  </h3>
                  <ResultCard result={lastResult} />
                </div>
              )}

              {/* Recent Activity - Session Only */}
              {scanStats.recentScans.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Session Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{scanStats.successfulCheckins}</p>
                        <p className="text-sm text-muted-foreground">Successful</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{scanStats.totalScanned}</p>
                        <p className="text-sm text-muted-foreground">Total Scanned</p>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {scanStats.recentScans.slice(0, 5).map((scan, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {scan.status === 'SUCCESS' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {scan.status === 'ALREADY_CHECKED_IN' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                            {scan.status === 'INVALID' && <XCircle className="h-4 w-4 text-red-600" />}
                            <span className="text-sm font-mono">
                              {scan.ticket?.ticketCode || 'Invalid Code'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {scan.timestamp && new Date(scan.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Ticket Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Ticket Codes (one per line, max 50)
                </label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-md font-mono text-sm"
                  rows={10}
                  placeholder="TCK_ABC123&#10;TCK_DEF456&#10;TCK_GHI789&#10;..."
                  value={bulkCodes}
                  onChange={(e) => setBulkCodes(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bulkCodes.split('\n').filter(line => line.trim()).length} codes entered
                </p>
              </div>
              <Button 
                onClick={handleBulkValidation} 
                disabled={!bulkCodes.trim() || isBulkProcessing}
                className="w-full"
              >
                {isBulkProcessing ? 'Processing...' : 'Process Tickets'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ScanDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}