// src/app/admin/events/[eventId]/checkin-list/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Ticket, Event } from '@prisma/client';
import { CheckinListTemplate } from '@/components/admin/CheckinListTemplate';
import { Skeleton } from '@/components/ui/skeleton';

type EventWithTickets = Event & { tickets: Ticket[] };

export default function CheckinListPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [data, setData] = useState<EventWithTickets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) return;

    async function fetchData() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/admin/events/${eventId}/checkin-list`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to load data');
        }
        const eventData = await response.json();
        setData(eventData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 font-bold">Error: {error}</div>;
  }
  
  if (!data) {
    return <div className="p-8">No data found for this event.</div>;
  }

  return <CheckinListTemplate event={data} tickets={data.tickets} />;
}