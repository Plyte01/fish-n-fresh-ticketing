// src/app/page.tsx
import { Suspense } from 'react';
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import { Skeleton } from '@/components/ui/skeleton';
import { cloudinaryPresets } from "@/lib/cloudinary";

// This function generates metadata dynamically based on DB settings
export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  return {
    title: settings?.metaTitle || "FISH'N FRESH Tickets",
    description: settings?.metaDescription || "Discover and buy tickets for the best events.",
  };
}

// Main component to fetch and display data
async function FeaturedEvents() {
  const [settings, featuredEvents] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.event.findMany({
      where: { isFeatured: true, status: { in: ['UPCOMING', 'LIVE'] }, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 6,
    }),
  ]);

  return (
    <div className="min-h-screen">
      <header className="relative h-80 md:h-96 text-white bg-gradient-to-br from-purple-900/80 via-blue-800/70 to-cyan-700/60 backdrop-blur-sm">
        {/* Animated geometric shapes - matching event header */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-blue-500 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-indigo-400 rounded-full blur-xl animate-ping"></div>
          <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-cyan-400 rounded-full blur-xl animate-pulse"></div>
        </div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {settings?.bannerImage && (
          <Image src={cloudinaryPresets.bannerImage(settings.bannerImage)} alt="Hero Banner" fill style={{ objectFit: 'cover' }} className="brightness-40 contrast-110 saturate-110" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-2xl text-white">{settings?.metaTitle || "Find Your Next Event"}</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl drop-shadow-lg text-white/90">{settings?.metaDescription || "The best events are waiting for you."}</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8 relative z-10">
        <section id="events" className="my-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Featured Events</h2>
          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="flex flex-col hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 eventful-pulse hover:scale-105">
                  {event.bannerImage && (
                    <div className="relative h-48 w-full">
                        <Image src={cloudinaryPresets.thumbnail(event.bannerImage)} alt={event.name} fill style={{ objectFit: 'cover' }} className="rounded-t-lg" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{new Date(event.startDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
                    <p className="text-sm text-muted-foreground">{event.venue}</p>
                    <p className="mt-4 font-semibold text-lg">KES {event.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"><Link href={`/event/${event.id}`}>Get Tickets</Link></Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 border-cyan-300/50">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Featured Events Right Now</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Check back soon, or if you&apos;re an organizer, get your event listed!</p>
              <Button asChild className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white" variant="outline"><Link href="/#contact">Contact Us</Link></Button>
            </div>
          )}
        </section>
        {/* About Section */}
        {settings?.aboutHtml && (
          <section id="about" className="my-16 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 p-8 rounded-lg shadow-xl border border-white/20">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">About Us</h2>
            <div
              className="prose max-w-none mx-auto dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: settings.aboutHtml }}
            />
          </section>
        )}
      </main>
    </div>
  );
}

// Skeleton component for Suspense fallback
function EventsSkeleton() {
    return (
        <div className="container mx-auto p-4 md:p-8 relative z-10">
            <h2 className="text-3xl font-bold text-center mb-8"><Skeleton className="h-8 w-64 mx-auto" /></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20">
                        <Skeleton className="h-48 w-full rounded-t-lg" />
                        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-6 w-1/4 mt-4" />
                        </CardContent>
                        <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Main page export uses Suspense
export default function HomePage() {
  // Generate structured data for the organization and website
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FISH'N FRESH",
    "url": baseUrl,
    "logo": `${baseUrl}/fish-logo.png`,
    "description": "Your premier destination for discovering and purchasing tickets to the most exciting events. Experience the best in entertainment, food, and culture.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+254 700 123 456",
      "contactType": "customer service",
      "email": "info@fishnfresh.com"
    },
    "sameAs": [
      // Add social media links when available
    ]
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FISH'N FRESH",
    "url": baseUrl,
    "description": "Discover and buy tickets for the best events in town",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/events?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      
      <Suspense fallback={<EventsSkeleton />}>
        <FeaturedEvents />
      </Suspense>
    </>
  );
}