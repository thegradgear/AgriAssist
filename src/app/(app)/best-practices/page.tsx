'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { PracticeCard, type Practice } from '@/components/best-practices/PracticeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, BookOpen, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NEWSAPI_KEY = process.env.NEXT_PUBLIC_NEWSAPI_KEY;

interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Function to map NewsAPI article to our Practice type
const mapArticleToPractice = (article: NewsApiArticle, index: number): Practice => {
  return {
    id: `${article.source.name?.replace(/\s+/g, '-').toLowerCase() || 'news'}-${index}-${new Date(article.publishedAt).getTime()}`,
    title: article.title,
    category: article.source.name || 'General Agriculture', // Or derive from keywords
    summary: article.description || 'Read more for details.',
    imageUrl: article.urlToImage || `https://placehold.co/600x400.png`, // Fallback
    imageHint: article.title.split(' ').slice(0, 2).join(' ').toLowerCase() || 'agriculture news', // Basic hint
    link: article.url,
    type: 'Article',
    isExternal: true, // Mark as external to use <img> tag
    publishedAt: article.publishedAt,
  };
};

export default function BestPracticesPage() {
  const [articles, setArticles] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('sustainable farming OR precision agriculture OR soil health OR crop rotation OR water management agriculture OR pest control agriculture'); // Default search
  const [currentQuery, setCurrentQuery] = useState(searchTerm);
  const { toast } = useToast();

  const fetchArticles = useCallback(async (query: string) => {
    if (!NEWSAPI_KEY || NEWSAPI_KEY === "YOUR_NEWSAPI_KEY") {
      setError("NewsAPI key is not configured. Please set NEXT_PUBLIC_NEWSAPI_KEY in your .env file.");
      setIsLoading(false);
      setArticles([]); // Clear articles if API key is missing
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Fetching general news from 'everything' endpoint, sorted by relevancy.
      // Language set to English.
      // Added common agricultural terms.
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=(${encodeURIComponent(query)})&language=en&sortBy=relevancy&pageSize=12&apiKey=${NEWSAPI_KEY}`
      );
      if (!response.ok) {
        let errorMsg = `Error: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                 errorMsg = errorData.message;
                 if(errorData.code === 'apiKeyMissing' || errorData.code === 'apiKeyInvalid') {
                    errorMsg = "Invalid or missing NewsAPI key. Please check your configuration.";
                 }
            }
        } catch(e) {/* ignore json parse error */}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles.map(mapArticleToPractice));
      } else {
        setArticles([]);
        toast({
            title: "No Articles Found",
            description: `No articles found for your query: "${query}". Try a different search term.`,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch articles:", err);
      setError(err.message || 'Failed to fetch articles.');
      setArticles([]); // Clear articles on error
      toast({
        variant: "destructive",
        title: "Error Fetching Articles",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchArticles(currentQuery);
  }, [fetchArticles, currentQuery]);

  useEffect(() => {
    if (!NEWSAPI_KEY || NEWSAPI_KEY === "YOUR_NEWSAPI_KEY") {
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "NewsAPI key is not configured. Please set NEXT_PUBLIC_NEWSAPI_KEY in your .env file to see articles.",
            duration: Infinity
        });
    }
  }, [toast]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentQuery(searchTerm.trim());
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    // Optionally, reset to default query or leave as is. For now, just clears input.
    // If you want to reset to default, uncomment:
    // setCurrentQuery('sustainable farming OR precision agriculture OR soil health OR crop rotation OR water management agriculture OR pest control agriculture');
  };

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Agricultural Articles &amp; News"
        description="Explore recent articles and news related to farming techniques, soil health, and agricultural innovations."
      />
      
      <form onSubmit={handleSearch} className="mb-8 flex flex-col sm:flex-row gap-2 items-center">
        <Input 
          placeholder="Search articles (e.g., 'organic pest control')" 
          className="flex-grow" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" disabled={isLoading || !searchTerm.trim()}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
         {searchTerm && (
          <Button type="button" variant="outline" onClick={handleClearSearch} disabled={isLoading}>
            Clear
          </Button>
        )}
      </form>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Loading articles...</p>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
           {(error.toLowerCase().includes("newsapi key") || error.toLowerCase().includes("next_public_newsapi_key")) && (
                <p className="text-xs mt-2">
                    Please verify your NewsAPI key in your <code>.env</code> or <code>src/.env</code> file (as <code>NEXT_PUBLIC_NEWSAPI_KEY</code>) and restart your development server.
                </p>
            )}
        </Alert>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
            <BookOpen className="mx-auto h-16 w-16 text-primary mb-4" />
            <p className="text-xl font-semibold">No Articles Found</p>
            <p className="text-muted-foreground mt-1">
              No articles were found for the current search query. Try broadening your search terms.
            </p>
        </div>
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((practice) => (
            <PracticeCard key={practice.id} practice={practice} />
          ))}
        </div>
      )}
    </div>
  );
}
