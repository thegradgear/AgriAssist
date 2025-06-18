'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { PracticeCard, type Practice } from '@/components/best-practices/PracticeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, BookOpen, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// NEWSAPI_KEY is no longer accessed directly on the client.
// It will be used by the /api/news route on the server.

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
    category: article.source.name || 'General Agriculture',
    summary: article.description || 'Read more for details.',
    imageUrl: article.urlToImage || `https://placehold.co/600x400.png`,
    imageHint: article.title.split(' ').slice(0, 2).join(' ').toLowerCase() || 'agriculture news',
    link: article.url,
    type: 'Article',
    isExternal: true,
    publishedAt: article.publishedAt,
  };
};

export default function BestPracticesPage() {
  const [articles, setArticles] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('sustainable farming OR precision agriculture OR soil health OR crop rotation OR water management agriculture OR pest control agriculture');
  const [currentQuery, setCurrentQuery] = useState(searchTerm);
  const { toast } = useToast();

  const fetchArticles = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from our internal API route
      const response = await fetch(`/api/news?query=${encodeURIComponent(query)}&pageSize=12`);
      
      if (!response.ok) {
        let errorMsg = `Error: ${response.statusText} (${response.status})`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) { // Our API route returns 'error'
                 errorMsg = errorData.error;
                 if(errorData.newsApiStatus === 401 || errorData.newsApiStatus === 426) { // 426 is NewsAPI's code for client-side requests on dev plan
                    errorMsg = "NewsAPI configuration error on the server or plan issue. Contact support.";
                 } else if (errorData.newsApiStatus === 429) {
                    errorMsg = "NewsAPI rate limit exceeded. Please try again later.";
                 }
            }
        } catch(e) {/* ignore json parse error */}
        throw new Error(errorMsg);
      }
      const data = await response.json(); // Data from our internal API
      
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles.map(mapArticleToPractice));
      } else if (data.articles && data.articles.length === 0) {
        setArticles([]);
        toast({
            title: "No Articles Found",
            description: `No articles found for your query: "${query}". Try a different search term.`,
        });
      } else if (data.error) { // Handle errors reported by our API wrapper
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("Failed to fetch articles:", err);
      const displayError = err.message || 'Failed to fetch articles.';
      setError(displayError);
      setArticles([]);
      toast({
        variant: "destructive",
        title: "Error Fetching Articles",
        description: displayError,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Initial fetch
    fetchArticles(currentQuery);
  }, [fetchArticles, currentQuery]);

  // Removed useEffect for client-side NEWSAPI_KEY check as it's now server-side.
  // The API route itself handles the key check.

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentQuery(searchTerm.trim());
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    // Optionally reset to default query or clear results.
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
           {/* Display a generic message for server-side key issues now */}
           {(error.toLowerCase().includes("newsapi key") || error.toLowerCase().includes("newsapi configuration error")) && (
                <p className="text-xs mt-2">
                    There might be an issue with the NewsAPI configuration on the server. Please contact support or check server logs.
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
