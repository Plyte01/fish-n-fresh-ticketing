// src/app/event/[eventId]/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { TicketPurchaseForm } from "@/components/public/TicketPurchaseForm";
import { Metadata } from "next";
import { cloudinaryPresets } from "@/lib/cloudinary";

// ✅ Correct param typing for App Router dynamic routes
type EventPageProps = {
  params: Promise<{ eventId: string }>;
};

// ✅ Await the `params` inside the function
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    return { title: 'Event Not Found' };
  }

  // Use SEO fields if available, otherwise fall back to generated content
  const title = event.metaTitle || event.name;
  const description = event.metaDescription || `Buy tickets for ${event.name}, happening on ${new Date(event.startDate).toLocaleDateString()} at ${event.venue}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.bannerImage ? [cloudinaryPresets.bannerImage(event.bannerImage)] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: event.bannerImage ? [cloudinaryPresets.bannerImage(event.bannerImage)] : [],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || !['UPCOMING', 'LIVE'].includes(event.status)) {
    notFound();
  }

  return (
    <div className="min-h-screen relative z-10">
      <header 
        className="relative h-80 sm:h-96 md:h-[450px] lg:h-[500px] overflow-hidden"
      >
        {/* Background with multiple layers */}
        <div className="absolute inset-0">
          {/* Animated geometric shapes */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-48 h-48 bg-purple-500 rounded-full blur-2xl animate-bounce"></div>
            <div className="absolute bottom-10 left-1/4 w-40 h-40 bg-blue-400 rounded-full blur-xl animate-ping"></div>
            <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-indigo-400 rounded-full blur-xl animate-pulse"></div>
          </div>

          {/* Gradient overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-800/70 to-cyan-700/60"
            style={event.themeColor ? {
              background: `linear-gradient(135deg, ${event.themeColor}80, ${event.themeColor}60, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.4))`
            } : undefined}
          ></div>

          {/* Banner image */}
          {event.bannerImage ? (
            <Image
              src={cloudinaryPresets.bannerImage(event.bannerImage)}
              alt={`${event.name} banner`}
              fill
              style={{ objectFit: 'cover' }}
              className="brightness-40 contrast-110 saturate-110"
              priority
              sizes="100vw"
            />
          ) : (
            <div 
              className="w-full h-full bg-gradient-to-br from-purple-800 via-blue-700 to-cyan-600"
              style={event.themeColor ? {
                background: `linear-gradient(135deg, ${event.themeColor}, #3b82f6, #06b6d4)`
              } : undefined}
            ></div>
          )}

          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="header-content absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4 z-10">
          {/* Event Status Badge */}
          <div className="mb-2 md:mb-4 opacity-100 animate-fadeIn">
            <span className={`inline-flex items-center px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wide backdrop-blur-sm border border-white/20 ${
              event.status === 'LIVE' 
                ? 'bg-red-500/80 text-white shadow-red-500/50' 
                : event.status === 'UPCOMING'
                ? 'bg-blue-500/80 text-white shadow-blue-500/50'
                : 'bg-gray-500/80 text-white shadow-gray-500/50'
            } shadow-lg`}>
              {event.status === 'LIVE' ? '🔴 Live Event' : 
               event.status === 'UPCOMING' ? '🎉 Upcoming Event' : 
               event.status}
            </span>
          </div>

          {/* Event Title */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black drop-shadow-2xl text-white mb-1 md:mb-2 leading-tight opacity-100 animate-slideUp px-2 max-w-5xl break-words">
            {event.name}
          </h1>
          
          {/* Event Subtitle */}
          <p className="text-sm sm:text-base md:text-xl text-white/90 mb-4 md:mb-6 drop-shadow-lg opacity-100 animate-slideUp animation-delay-200 px-2 max-w-3xl break-words">
            {event.venue}
          </p>

          {/* Event Details - Simple Text Layout */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-white/90 opacity-100 animate-slideUp animation-delay-400 mb-4 md:mb-6">
            {/* Date */}
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span className="text-sm md:text-base font-medium">
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <span className="text-lg">⏰</span>
              <span className="text-sm md:text-base font-medium">
                {new Date(event.startDate).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="text-sm md:text-base font-medium">
                {event.venue}
              </span>
            </div>
          </div>

          {/* Price Badge */}
          <div className="mt-4 md:mt-6 opacity-100 animate-slideUp animation-delay-600">
            <div className="backdrop-blur-md bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-white/20 rounded-full px-4 py-2 md:px-6 md:py-3 shadow-xl">
              <span className="text-lg md:text-2xl font-bold text-white">
                KSh {event.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs md:text-sm text-white/90 ml-1 md:ml-2">per ticket</span>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-6 sm:h-8 md:h-12 lg:h-16">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" className="text-white"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" className="text-white"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" className="text-white"></path>
          </svg>
        </div>
      </header>

      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 p-8 -mt-8 relative z-10">
        <div className="lg:col-span-2 space-y-8">
          {/* About This Event Card */}
          {event.aboutHtml ? (
            <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-white/20 p-8 rounded-lg shadow-xl border">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                About This Event
              </h2>
              <div 
                className="prose prose-lg max-w-none dark:prose-invert prose-blue prose-headings:bg-gradient-to-r prose-headings:from-cyan-600 prose-headings:to-blue-600 prose-headings:bg-clip-text prose-headings:text-transparent"
                dangerouslySetInnerHTML={{ __html: event.aboutHtml }}
              />
            </div>
          ) : (
            <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-white/20 p-8 rounded-lg shadow-xl border">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                About This Event
              </h2>
              <div className="space-y-6">
                {/* Use meta description if available */}
                {event.metaDescription ? (
                  <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {event.metaDescription}
                  </div>
                ) : (
                  <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Join us for <strong>{event.name}</strong> - an exciting event happening at {event.venue}.
                  </div>
                )}
                
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                        📅
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">When</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          <br />
                          {new Date(event.startDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                          {event.endDate && new Date(event.endDate).toDateString() !== new Date(event.startDate).toDateString() && (
                            <>
                              <br />
                              <span className="text-sm">
                                Until {new Date(event.endDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                        📍
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Where</h3>
                        <p className="text-gray-600 dark:text-gray-400">{event.venue}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                        💰
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Ticket Price</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          KSh {event.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} per person
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                        🎫
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Event Status</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {event.status === 'LIVE' ? 'Currently Live' : 
                           event.status === 'UPCOMING' ? 'Upcoming Event' : 
                           event.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                  <p className="text-center text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Ready to join us?</span> Get your tickets now and be part of this amazing experience!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEO Information Card */}
          {(event.metaTitle || event.metaDescription) && (
            <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-white/20 p-8 rounded-lg shadow-xl border">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Additional Information
              </h2>
              <div className="space-y-4">
                {event.metaTitle && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Meta Title
                    </h3>
                    <p className="text-lg text-gray-900 dark:text-white">{event.metaTitle}</p>
                  </div>
                )}
                {event.metaDescription && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{event.metaDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ticket Purchase Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <TicketPurchaseForm event={event} />
          </div>
        </div>
      </main>
    </div>
  );
}
