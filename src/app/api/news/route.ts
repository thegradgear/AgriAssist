
// src/app/api/news/route.ts
import { NextResponse } from 'next/server';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

// A curated list of reputable domains for agricultural and related business news.
const RELEVANT_DOMAINS = [
    // India-specific
    'krishijagran.com',
    'icar.org.in',
    'thehindubusinessline.com',
    'economictimes.indiatimes.com',
    'livemint.com',
    'business-standard.com',
    'pib.gov.in', // Press Information Bureau for government news
    
    // International / Agri-focused
    'agriculture.com',
    'agweb.com',
    'croplife.com',
    'successfulfarming.com',
    'fwi.co.uk', // Farmers Weekly
    'agriland.ie',
].join(',');


export async function GET(request: Request) {
  if (!NEWSAPI_KEY) {
    return NextResponse.json({ error: 'NewsAPI key is not configured on the server.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const pageSize = searchParams.get('pageSize') || '12';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required.' }, { status: 400 });
  }

  try {
    // New approach: Search the user's query only within the specified domains.
    // This is more reliable than AI validation for ensuring topic relevance.
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&domains=${RELEVANT_DOMAINS}&language=en&sortBy=relevancy&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
    
    const apiResponse = await fetch(newsApiUrl, {
      headers: {
        'User-Agent': 'AgriAssistApp/1.0', 
      }
    });

    if (!apiResponse.ok) {
      let errorMsg = `NewsAPI Error: ${apiResponse.statusText} (${apiResponse.status})`;
      try {
        const errorData = await apiResponse.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        // Ignore JSON parse error if response is not JSON
      }
      return NextResponse.json({ error: errorMsg, newsApiStatus: apiResponse.status }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in /api/news route:', error);
    return NextResponse.json({ error: 'Failed to fetch news articles from the server.', details: error.message }, { status: 500 });
  }
}
