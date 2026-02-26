import { NextRequest, NextResponse } from 'next/server';
import { PDFGenerationService, HotelConfirmationPDFData } from '@/utils/services/pdfGenerationService';
import { secureLog } from '@/utils/secure-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotel, trip, type } = body;

    if (!hotel || !trip) {
      return NextResponse.json(
        { error: 'Hotel and trip data are required' },
        { status: 400 }
      );
    }

    if (type !== 'hotel') {
      return NextResponse.json(
        { error: 'Only hotel confirmation PDFs are currently supported' },
        { status: 400 }
      );
    }

    secureLog.log('Generating PDF confirmation', { 
      tripId: trip.id, 
      hotelId: hotel.id,
      type 
    });

    const pdfData: HotelConfirmationPDFData = {
      hotel,
      trip,
    };

    const pdfBlob = await PDFGenerationService.generateHotelConfirmationPDF(pdfData);
    
    // Convert blob to buffer for response
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Generate filename
    const filename = `hotel-confirmation-${trip.id}-${hotel.id}.pdf`;

    secureLog.log('PDF confirmation generated successfully', { 
      tripId: trip.id,
      hotelId: hotel.id,
      filename,
      size: buffer.length 
    });

    // Return PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    secureLog.error('Error generating PDF confirmation', { error });
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF confirmation'
      },
      { status: 500 }
    );
  }
}
