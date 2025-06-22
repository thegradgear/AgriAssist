
// src/app/api/mandi-prices/route.ts
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

const API_KEY = process.env.DATA_GOV_IN_API_KEY;
const RESOURCE_ID = process.env.AGMARKNET_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070'; // Default resource for daily prices

// Sample data to be used as a fallback
const MOCK_MANDI_DATA = [
    { state: 'Maharashtra', district: 'Nashik', market: 'Pimpalgaon', commodity: 'Onion', variety: 'Red', min_price: '1800', max_price: '2200', modal_price: '2000' },
    { state: 'Uttar Pradesh', district: 'Agra', market: 'Agra', commodity: 'Potato', variety: 'Desi', min_price: '1000', max_price: '1300', modal_price: '1150' },
    { state: 'Punjab', district: 'Ludhiana', market: 'Ludhiana', commodity: 'Wheat', variety: 'FAQ', min_price: '2100', max_price: '2150', modal_price: '2125' },
    { state: 'Karnataka', district: 'Kolar', market: 'Kolar', commodity: 'Tomato', variety: 'Hybrid', min_price: '800', max_price: '1100', modal_price: '950' },
    { state: 'Rajasthan', district: 'Jaipur', market: 'Jaipur (F&V)', commodity: 'Mustard', variety: 'Other', min_price: '5500', max_price: '5800', modal_price: '5650' },
];


export async function GET(request: Request) {
  if (!API_KEY) {
    console.warn('DATA_GOV_IN_API_KEY not found. Returning mock data.');
    return NextResponse.json({ 
        records: MOCK_MANDI_DATA, 
        isMockData: true, 
        error: "API key for data.gov.in is not configured on the server."
    });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date'); // Expects YYYY-MM-DD
  const limit = searchParams.get('limit') || '100';

  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter is required.' }, { status: 400 });
  }

  let formattedDate;
  try {
    formattedDate = format(new Date(dateParam), 'dd-MM-yyyy');
  } catch (e) {
    return NextResponse.json({ error: 'Invalid date format. Please use YYYY-MM-DD.' }, { status: 400 });
  }
  
  const apiUrl = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=${limit}&filters[arrival_date]=${formattedDate}`;

  try {
    const apiResponse = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } 
    });

    if (!apiResponse.ok) {
        throw new Error(`Failed to fetch data from Agmarknet API. Status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data.records) {
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

    return NextResponse.json({ records: data.records || [], isMockData: false });

  } catch (error: any) {
    console.error('Error fetching live Mandi prices, returning mock data:', error.message);
    return NextResponse.json({
      records: MOCK_MANDI_DATA,
      isMockData: true,
      error: "Live data is currently unavailable. Displaying example data."
    });
  }
}
