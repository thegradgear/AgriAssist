
// src/app/api/mandi-prices/route.ts
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

const API_KEY = process.env.DATA_GOV_IN_API_KEY;
const RESOURCE_ID = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070'; // Default resource for daily prices

export async function GET(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'API key for data.gov.in is not configured on the server. Please set DATA_GOV_IN_API_KEY.' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date'); // Expects YYYY-MM-DD
  const limit = searchParams.get('limit') || '100';

  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter is required.' }, { status: 400 });
  }

  // data.gov.in API expects date in DD-MM-YYYY format
  let formattedDate;
  try {
    formattedDate = format(new Date(dateParam), 'dd-MM-yyyy');
  } catch (e) {
    return NextResponse.json({ error: 'Invalid date format. Please use YYYY-MM-DD.' }, { status: 400 });
  }
  
  const apiUrl = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=${limit}&filters[arrival_date]=${formattedDate}`;

  try {
    const apiResponse = await fetch(apiUrl, {
        headers: {
            'Accept': 'application/json',
        },
        // Using a longer cache time as the data is daily
        next: { revalidate: 3600 } 
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Agmarknet API Error:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch data from Agmarknet API. Status: ${apiResponse.status}` },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();

    if (data.records) {
        // Sort records by state, then district, then market
        data.records.sort((a: any, b: any) => {
            if (a.state < b.state) return -1;
            if (a.state > b.state) return 1;
            if (a.district < b.district) return -1;
            if (a.district > b.district) return 1;
            if (a.market < b.market) return -1;
            if (a.market > b.market) return 1;
            return 0;
        });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in /api/mandi-prices route:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching Mandi prices.', details: error.message },
      { status: 500 }
    );
  }
}
