// src/app/api/tickets/download/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTicketPdf } from '@/lib/pdf';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketCode = searchParams.get('code');

  if (!ticketCode) {
    return NextResponse.json({ error: 'Ticket code is required' }, { status: 400 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: { event: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (!ticket.qrCodeUrl) {
      return NextResponse.json({ error: 'QR code missing' }, { status: 404 });
    }

    const pdfBuffer = await generateTicketPdf({ ticket, qrCodeDataURL: ticket.qrCodeUrl });

    // Return the PDF as a file download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket.ticketCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF download error:", error);
    
    // For development, provide a helpful error message
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ 
        error: 'PDF generation failed in development environment',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Install Google Chrome or run: npx puppeteer browsers install chrome'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}