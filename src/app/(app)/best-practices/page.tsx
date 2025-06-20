
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { PracticeCard, type Practice } from '@/components/best-practices/PracticeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, BookOpen, Search, X } from 'lucide-react'; // Added X icon
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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

const DEFAULT_ARTICLE_QUERY = 'sustainable farming OR precision agriculture OR soil health OR crop rotation OR water management agriculture OR pest control agriculture';

const SkeletonPracticeCard = () => (
  <div className="bg-card shadow-md rounded-lg overflow-hidden">
    <Skeleton className="w-full h-48" />
    <div className="p-4">
      <Skeleton className="h-5 w-3/4 mb-2" /> {/* CardTitle skeleton (text-lg) */}
      <Skeleton className="h-3 w-1/2 mb-3" /> {/* Category skeleton (text-xs) */}
      <Skeleton className="h-4 w-full mb-1" /> {/* Summary skeleton (text-sm) */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-3" />
      <Skeleton className="h-4 w-1/3" /> {/* Link/Date skeleton (text-sm/xs) */}
    </div>
  </div>
);


export default function BestPracticesPage() {
  const [articles, setArticles] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(DEFAULT_ARTICLE_QUERY);
  const [currentQuery, setCurrentQuery] = useState(DEFAULT_ARTICLE_QUERY);
  const { toast } = useToast();

  const fetchArticles = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // If the query is effectively empty after trimming, use the default query.
      // Otherwise, an empty query to NewsAPI might return irrelevant results or errors.
      const effectiveQuery = query.trim() ? query : DEFAULT_ARTICLE_QUERY;
      if (query.trim() === '' && currentQuery === '') { // Only toast if user intentionally searched for empty and it wasn't an auto-load
          // No toast here, the empty results message will suffice.
      }


      const response = await fetch(`/api/news?query=${encodeURIComponent(effectiveQuery)}&pageSize=12`);
      
      if (!response.ok) {
        let errorMsg = `Error: ${response.statusText} (${response.status})`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                 errorMsg = errorData.error;
                 if(errorData.newsApiStatus === 401 || errorData.newsApiStatus === 426) {
                    errorMsg = "NewsAPI configuration error on the server or plan issue. Contact support.";
                 } else if (errorData.newsApiStatus === 429) {
                    errorMsg = "NewsAPI rate limit exceeded. Please try again later.";
                 }
            }
        } catch(e) {/* ignore json parse error */}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles.map(mapArticleToPractice));
      } else if (data.articles && data.articles.length === 0) {
        setArticles([]);
        // Avoid toasting if it's the default query that returned no articles (e.g., initial load scenario)
        if (query !== DEFAULT_ARTICLE_QUERY && query.trim() !== '') {
            toast({
                title: "No Articles Found",
                description: `No articles found for your query: "${query}". Try a different search term.`,
            });
        }
      } else if (data.error) {
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
  }, [toast, currentQuery]); // Added currentQuery to dep array

  useEffect(() => {
    // Fetch articles if currentQuery has a value (even if it's the default)
    // If currentQuery is an empty string, it implies an intentional empty search, 
    // leading to the "No articles found" message being displayed without an API call.
    if (currentQuery.trim()) {
      fetchArticles(currentQuery);
    } else if (currentQuery === '') { // Handle intentional empty search
      setArticles([]);
      setIsLoading(false);
    }
    // Initial load: currentQuery is DEFAULT_ARTICLE_QUERY, so it fetches.
  }, [fetchArticles, currentQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Set currentQuery to whatever is in searchTerm. If searchTerm is empty,
    // currentQuery becomes empty, and useEffect will handle it by clearing articles.
    setCurrentQuery(searchTerm.trim());
  };
  
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Agricultural Articles & News"
        description="Explore recent articles and news related to farming techniques, soil health, and agricultural innovations."
      />
      
      <form onSubmit={handleSearch} className="mb-8 flex flex-row gap-2 items-center">
        <div className="relative flex-grow">
          <Input 
            placeholder="Search articles (e.g., 'organic pest control')" 
            className="w-full pr-10" // Ensure padding for the 'X' button
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button type="submit" disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <SkeletonPracticeCard key={index} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
           {(error.toLowerCase().includes("newsapi key") || error.toLowerCase().includes("newsapi configuration error")) && (
                <p className="text-xs mt-2 leading-normal">
                    There might be an issue with the NewsAPI configuration on the server. Please contact support or check server logs.
                </p>
            )}
        </Alert>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <div className="text-center py-10 rounded-lg border bg-card shadow-sm">
            <BookOpen className="mx-auto h-16 w-16 text-primary mb-4" />
            <p className="text-xl font-medium leading-snug">No Articles Found</p>
            <p className="text-muted-foreground mt-1 text-base leading-normal">
              {/* Message depends on whether an active search query (non-default) led to no results, or if it's the initial state / default query with no results */}
              {currentQuery !== DEFAULT_ARTICLE_QUERY && currentQuery.trim() !== '' 
                ? `No articles found for your query: "${currentQuery}". Try a different search term.`
                : "No articles found. Try searching for specific topics or broaden your terms."
              }
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
