// src/app/api/news/route.ts
import { NextResponse } from 'next/server';
import { validateSearchTopic } from '@/ai/flows/validate-search-topic-flow';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

const CORE_AGRICULTURE_KEYWORDS = 'farming OR agriculture OR horticulture OR crops OR soil OR agronomy';

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
    // Step 1: Validate the topic using the Genkit flow
    const validationResult = await validateSearchTopic({ searchQuery: query });

    if (!validationResult.isRelevant) {
      return NextResponse.json(
        { 
          error: `Search topic is not relevant. Please search for topics related to farming.`,
          reasoning: validationResult.reasoning 
        },
        { status: 400 }
      );
    }

    // Step 2: If relevant, construct the final query for NewsAPI
    // This ensures that the search results from NewsAPI are still filtered by core keywords.
    const enhancedQuery = `(${query}) AND (${CORE_AGRICULTURE_KEYWORDS})`;
    
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      enhancedQuery
    )}&language=en&sortBy=relevancy&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
    
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
    // Check if the error is from our validation logic
    if (error.message.includes("Search topic is not relevant")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch news articles from the server.', details: error.message }, { status: 500 });
  }
}
