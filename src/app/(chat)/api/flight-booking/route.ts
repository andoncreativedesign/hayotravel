import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    
    if (!bookingData) {
      return NextResponse.json(
        { error: 'Booking data is required' },
        { status: 400 }
      );
    }

    console.log(`Proxying flight booking request:`, bookingData);

    const duffelResponse = await fetch(
      'https://api.duffel.com/air/orders',
      {
        method: 'POST',
        headers: {
          'Accept-Encoding': 'gzip',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`
        },
        body: JSON.stringify({ data: bookingData })
      }
    );

    console.log(`Duffel flight booking API response status: ${duffelResponse.status}`);

    const data = await duffelResponse.json();

    if (!duffelResponse.ok) {
      console.error('Duffel flight booking API error:', data);
      
      // Enhanced error handling for phone number validation
      const errorMessage = data.errors?.[0]?.message || `Duffel API error: ${duffelResponse.status}`;
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          data 
        },
        { status: duffelResponse.status }
      );
    }

    console.log('Successfully created flight booking via Duffel API');

    return NextResponse.json({ 
      success: true,
      data,
      status: 'success' 
    });
  } catch (error) {
    console.error('Error in flight booking API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}