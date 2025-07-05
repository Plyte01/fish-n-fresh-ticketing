// src/app/embed/[eventId]/page.tsx 
import { prisma } from "@/lib/prisma";
import { TicketPurchaseForm } from "@/components/public/TicketPurchaseForm";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || !['UPCOMING', 'LIVE'].includes(event.status)) {
    return (
      <div className="flex items-center justify-center h-screen p-4 text-center">
        <p className="text-red-500 font-semibold">
          This event is not currently available for ticket sales.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <TicketPurchaseForm event={event} />
    </div>
  );
}
