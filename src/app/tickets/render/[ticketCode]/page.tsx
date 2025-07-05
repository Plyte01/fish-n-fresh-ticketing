// src/app/tickets/render/[ticketCode]/page.tsx
import { prisma } from '@/lib/prisma';
import { TicketTemplate } from '@/components/tickets/TicketTemplate';
import { notFound } from 'next/navigation';

export default async function TicketRenderPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const { ticketCode } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    include: { event: true },
  });

  if (!ticket || !ticket.qrCodeUrl) {
    notFound();
  }

  return (
    <html>
      <head>
        <title>{`${ticket.event.name} - Ticket`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <TicketTemplate ticket={ticket} qrCodeDataURL={ticket.qrCodeUrl} />
      </body>
    </html>
  );
}
