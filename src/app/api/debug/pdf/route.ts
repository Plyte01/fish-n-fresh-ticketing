// src/app/api/debug/pdf/route.ts
import { NextResponse } from 'next/server';
import { generateTicketPdf } from '@/lib/pdf';
import qrcode from 'qrcode';

export async function GET(request: Request) {
  console.log('PDF debug endpoint called');
  
  try {
    // Create a mock ticket for testing with correct Prisma structure
    const mockTicket = {
      id: 'test-ticket-id',
      reference: 'TCK_TEST123',
      ticketCode: 'TEST123',
      qrCodeUrl: null, // Will be generated
      checkedIn: false,
      issuedAt: new Date(),
      phone: '+254712345678',
      email: 'test@example.com',
      eventId: 'test-event-id',
      paymentId: 'test-payment-id',
      event: {
        id: 'test-event-id',
        name: 'Test Event - PDF Generation Check',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        venue: 'Test Venue, Nairobi',
        price: 1500.00,
        isFeatured: false,
        status: 'UPCOMING' as const,
        bannerImage: null,
        themeColor: null,
        aboutHtml: null,
        metaTitle: null,
        metaDescription: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    // Generate a real QR code for testing
    console.log('Generating QR code...');
    const qrCodeDataURL = await qrcode.toDataURL(`TICKET:${mockTicket.ticketCode}:${mockTicket.reference}`, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('QR code generated, length:', qrCodeDataURL.length);

    console.log('Generating test PDF...');
    const pdfBuffer = await generateTicketPdf({
      ticket: mockTicket,
      qrCodeDataURL: qrCodeDataURL
    });

    console.log('Test PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Validate PDF
    const pdfHeader = pdfBuffer.toString('ascii', 0, 4);
    const isValidPdf = pdfHeader === '%PDF';
    
    console.log('PDF validation - Header:', pdfHeader, 'Valid:', isValidPdf);

    if (!isValidPdf) {
      console.error('Generated PDF is invalid - does not start with %PDF header');
      return NextResponse.json({
        success: false,
        error: 'Generated PDF is invalid',
        size: pdfBuffer.length,
        header: pdfHeader,
        bufferStart: pdfBuffer.slice(0, 20).toString('hex')
      }, { status: 500 });
    }

    // Return the PDF for download/inspection
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-ticket.pdf"',
        'X-PDF-Size': pdfBuffer.length.toString(),
        'X-PDF-Valid': isValidPdf.toString()
      },
    });

  } catch (error) {
    console.error('PDF debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
