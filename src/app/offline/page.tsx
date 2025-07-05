'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiOff, RefreshCw, Calendar, MapPin, Ticket } from 'lucide-react';

// Define interface for cached event
interface CachedEvent {
  name?: string;
  venue?: string;
  startDate?: string;
  date?: string;
  price?: number;
  id?: string;
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [cachedEvents, setCachedEvents] = useState<CachedEvent[]>([]);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Try to load cached events from localStorage
    try {
      const cached = localStorage.getItem('fishnfresh-cached-events');
      if (cached) {
        setCachedEvents(JSON.parse(cached).slice(0, 3)); // Show max 3 cached events
      }
    } catch {
      console.log('No cached events available');
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  if (isOnline) {
    // If back online, redirect to home
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <WifiOff className="h-20 w-20 text-blue-500 mx-auto mb-4 animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <Badge variant="destructive" className="animate-bounce">Offline</Badge>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            You&apos;re Offline
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            No internet connection detected. Don&apos;t worry - you can still view cached content and the app will automatically reconnect when your connection is restored.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again {retryCount > 0 && `(${retryCount})`}
            </Button>
            <Button variant="outline" onClick={handleGoBack}>
              Go Back
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Connection Status: Offline
              </span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
              The app will automatically reconnect when your internet connection is restored. You may continue browsing cached content below.
            </p>
          </CardContent>
        </Card>

        {/* Cached Events */}
        {cachedEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-500" />
              Recently Viewed Events
            </h2>
            <p className="text-muted-foreground mb-6">
              Here are some events you&apos;ve recently viewed. Note that information may be outdated.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cachedEvents.map((event: CachedEvent, index) => (
                <Card key={index} className="overflow-hidden opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg line-clamp-1">{event.name || 'Event Name'}</CardTitle>
                      <Badge variant="secondary">Cached</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date || 'Date unavailable'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.venue || 'Venue unavailable'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Ticket className="h-4 w-4 mr-2" />
                        <span className="font-medium">{event.price || 'Price unavailable'}</span>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Offline Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-green-500" />
                Saved Tickets
              </CardTitle>
              <CardDescription>
                View your previously downloaded tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/lookup'}>
                Access Saved Tickets
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Cached Content
              </CardTitle>
              <CardDescription>
                Browse recently viewed pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/'}>
                  Homepage
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/events'}>
                  Events List
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => window.location.href = '/about'}>
                  About Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips for Offline Usage */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              💡 Offline Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ul className="space-y-2 text-sm">
              <li>• You can still view downloaded tickets and cached event information</li>
              <li>• The app will automatically sync when your connection returns</li>
              <li>• Some features like purchasing tickets require an internet connection</li>
              <li>• Install this app for a better offline experience</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 