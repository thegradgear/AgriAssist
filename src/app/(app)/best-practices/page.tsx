
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { PracticeCard, type Practice } from '@/components/best-practices/PracticeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, BookOpen, Search, X } from 'lucide-react'; 
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

const DEFAULT_ARTICLE_QUERY = 'modern farming techniques';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentQuery, setCurrentQuery] = useState(DEFAULT_ARTICLE_QUERY);
  const { toast } = useToast();

  const fetchArticles = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const effectiveQuery = query.trim() ? query : DEFAULT_ARTICLE_QUERY;

      const response = await fetch(`/api/news?query=${encodeURIComponent(effectiveQuery)}&pageSize=12`);
      
      if (!response.ok) {
        let errorMsg = `Error: ${response.statusText} (${response.status})`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
                 errorMsg = errorData.error;
                 if(response.status === 401 || errorData.newsApiStatus === 426) {
                    errorMsg = "NewsAPI configuration error on the server or plan issue. Contact support.";
                 } else if (response.status === 429) {
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
      
      const isRelevanceError = displayError.toLowerCase().includes('not relevant');
      
      toast({
        variant: "destructive",
        title: isRelevanceError ? "Irrelevant Topic" : "Error Fetching Articles",
        description: displayError,
      });

    } finally {
      setIsLoading(false);
    }
  }, [toast]); 

  useEffect(() => {
    fetchArticles(DEFAULT_ARTICLE_QUERY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        setCurrentQuery(searchTerm.trim());
        fetchArticles(searchTerm.trim());
    } else {
        toast({
            variant: "destructive",
            title: "Empty Search",
            description: "Please enter a topic to search for."
        });
    }
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
            placeholder="Search for farming topics..." 
            className="w-full pr-10 border-foreground/30 dark:border-muted-foreground" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            suppressHydrationWarning
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
              suppressHydrationWarning
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Button type="submit" disabled={isLoading} suppressHydrationWarning>
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

      {!isLoading && error && !error.toLowerCase().includes('not relevant') && (
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
              {currentQuery !== DEFAULT_ARTICLE_QUERY 
                ? `No articles found for your query: "${currentQuery}". Try a different search term.`
                : "No articles found. Try searching for specific topics."
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
