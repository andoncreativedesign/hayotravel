import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { hotelId } = await request.json();
    
    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    console.log(`Proxying hotel rates request for hotel ID: ${hotelId}`);

    const duffelResponse = await fetch(
      `https://api.duffel.com/stays/search_results/${hotelId}/actions/fetch_all_rates`,
      {
        method: 'POST',
        headers: {
          'Accept-Encoding': 'gzip',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`
        }
      }
    );

    console.log(`Duffel API response status: ${duffelResponse.status}`);

    if (!duffelResponse.ok) {
      const errorText = await duffelResponse.text();
      console.error('Duffel API error:', errorText);
      return NextResponse.json(
        { error: `Duffel API error: ${duffelResponse.status}` },
        { status: duffelResponse.status }
      );
    }

    const data = await duffelResponse.json();
    console.log('Successfully fetched hotel rates from Duffel API');

    return NextResponse.json({ data, status: 'success' });
  } catch (error) {
    console.error('Error in hotel rates API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 