// src/lib/seo.ts
/**
 * SEO utility functions for structured data and metadata
 */

export interface EventSEOData {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  price: number;
  status: string;
  bannerImage?: string;
  updatedAt: Date;
}

/**
 * Generate structured data for an event
 */
export function generateEventStructuredData(event: EventSEOData, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description || `Join us for ${event.name} at ${event.venue}`,
    "startDate": event.startDate.toISOString(),
    "endDate": event.endDate.toISOString(),
    "eventStatus": event.status === 'LIVE' ? 
      "https://schema.org/EventScheduled" : 
      "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.venue,
      "address": event.venue
    },
    "image": event.bannerImage ? [`${baseUrl}/api/image-proxy?url=${encodeURIComponent(event.bannerImage)}`] : [],
    "offers": {
      "@type": "Offer",
      "price": event.price,
      "priceCurrency": "KES",
      "availability": event.status === 'UPCOMING' ? 
        "https://schema.org/InStock" : 
        "https://schema.org/LimitedAvailability",
      "url": `${baseUrl}/event/${event.id}`,
      "validFrom": new Date().toISOString()
    },
    "organizer": {
      "@type": "Organization",
      "name": "FISH'N FRESH",
      "url": baseUrl
    },
    "url": `${baseUrl}/event/${event.id}`
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(baseUrl: string, contactInfo?: {
  phone?: string;
  email?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FISH'N FRESH",
    "url": baseUrl,
    "logo": `${baseUrl}/Logo.png`,
    "description": "Your premier destination for discovering and purchasing tickets to the most exciting events. Experience the best in entertainment, food, and culture.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": contactInfo?.phone || "+254 700 123 456",
      "contactType": "customer service",
      "email": contactInfo?.email || "info@fishnfresh.com"
    },
    "sameAs": [
      // Add social media links when available
    ]
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData(baseUrl: string) {
  return {
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
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(baseUrl: string, items: Array<{name: string; url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}
