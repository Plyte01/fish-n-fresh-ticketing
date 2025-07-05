// src/app/events/page.tsx
import { Suspense } from 'react';
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cloudinaryPresets } from "@/lib/cloudinary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Events | FISH'N FRESH",
  description: "Discover amazing events happening near you. Browse and buy tickets for the best entertainment, food, and cultural events.",
  openGraph: {
    title: "All Events | FISH'N FRESH",
    description: "Discover amazing events happening near you. Browse and buy tickets for the best entertainment, food, and cultural events.",
    type: 'website',
  },
};

async function EventsList() {
  const events = await prisma.event.findMany({
    where: { 
      status: { in: ['UPCOMING', 'LIVE'] }, 
      startDate: { gte: new Date() } 
    },
    orderBy: { startDate: 'asc' },
    take: 50, // Limit to 50 events
  });

  if (events.length === 0) {
    return (
      <div className="text-center py-12 backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 border-purple-300/50 rounded-lg border-2 border-dashed">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">No Events Available</h2>
        <p className="text-muted-foreground">
          There are no upcoming events at the moment. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => {
        // Debug: Log the image URLs
        const originalImage = event.bannerImage;
        const optimizedThumbnail = event.bannerImage ? cloudinaryPresets.thumbnail(event.bannerImage) : 'No banner image';
        
        // Log outside of JSX
        if (process.env.NODE_ENV === 'development') {
          console.log('Event:', event.name);
          console.log('Original bannerImage:', originalImage);
          console.log('Optimized thumbnail:', optimizedThumbnail);
        }
        
        return (
        <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 eventful-pulse hover:scale-105">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={event.bannerImage ? cloudinaryPresets.thumbnail(event.bannerImage) : "/icons/fallback-image.png"}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-2 right-2">
              <Badge variant={event.status === 'LIVE' ? 'destructive' : 'secondary'}>
                {event.status}
              </Badge>
            </div>
          </div>
          
          <CardHeader>
            <CardTitle className="line-clamp-2">{event.name}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2" />
              {format(new Date(event.startDate), 'PPP')} at {format(new Date(event.startDate), 'p')}
              {event.endDate && new Date(event.endDate).toDateString() !== new Date(event.startDate).toDateString() && (
                <span> - {format(new Date(event.endDate), 'PPP')}</span>
              )}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {event.venue}
            </div>
            
            {event.aboutHtml && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.aboutHtml.replace(/<[^>]*>/g, '')} {/* Strip HTML tags for preview */}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              KES {event.price.toLocaleString()}
            </div>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
              <Link href={`/event/${event.id}`}>
                View Event
              </Link>
            </Button>
          </CardFooter>
        </Card>
        );
      })}
    </div>
  );
}

export default function EventsPage() {
  // Generate structured data for the events page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Events",
    "description": "Discover amazing events happening near you",
    "url": `${baseUrl}/events`,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Events List",
      "description": "List of upcoming events available for ticket purchase"
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageStructuredData) }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">All Events</h1>
        <p className="text-xl text-muted-foreground">
          Discover amazing events happening near you
        </p>
      </div>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20">
              <div className="aspect-video bg-muted" />
              <CardHeader>
                <div className="h-6 bg-muted rounded" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      }>
        <EventsList />
      </Suspense>
    </div>
    </>
  );
}
