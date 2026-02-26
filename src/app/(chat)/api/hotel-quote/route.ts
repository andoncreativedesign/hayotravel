import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { rate_id } = await request.json();
    
    if (!rate_id) {
      return NextResponse.json(
        { error: 'Rate ID is required' },
        { status: 400 }
      );
    }

    console.log(`Proxying hotel quote request for rate ID: ${rate_id}`);

    const duffelResponse = await fetch(
      'https://api.duffel.com/stays/quotes',
      {
        method: 'POST',
        headers: {
          'Accept-Encoding': 'gzip',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`
        },
        body: JSON.stringify({ 
          data: { rate_id } 
        })
      }
    );

    console.log(`Duffel quote API response status: ${duffelResponse.status}`);

    const data = await duffelResponse.json();

    if (!duffelResponse.ok) {
      console.error('Duffel quote API error:', data);
      return NextResponse.json(
        { 
          success: false,
          error: data.errors?.[0]?.message || `Duffel API error: ${duffelResponse.status}`,
          data 
        },
        { status: duffelResponse.status }
      );
    }

    console.log('Successfully created hotel quote via Duffel API');

    return NextResponse.json({ 
      success: true,
      data,
      status: 'success' 
    });
  } catch (error) {
    console.error('Error in hotel quote API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}