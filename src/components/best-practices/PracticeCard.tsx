import Image from 'next/image'; // Keep for placehold.co
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export interface Practice {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageUrl: string;
  imageHint: string; 
  link: string; 
  type: 'Article' | 'Case Study' | 'Video Tutorial' | string; // Made string to be more flexible
  isExternal?: boolean; // Flag to differentiate between next/image and <img>
  publishedAt?: string; // For articles from API
}

interface PracticeCardProps {
  practice: Practice;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch (e) {
    return ''; // Or some other fallback for invalid dates
  }
};


export function PracticeCard({ practice }: PracticeCardProps) {
  const displayImageUrl = practice.imageUrl || 'https://placehold.co/600x400.png';
  const displayImageAlt = practice.title || 'Practice image';

  return (
    <Link 
      href={practice.link} 
      target="_blank" // All API links will be external
      rel="noopener noreferrer"
      className="block group h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card">
        <div className="relative w-full h-48">
          {practice.isExternal && practice.imageUrl && !practice.imageUrl.startsWith('https://placehold.co') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImageUrl}
              alt={displayImageAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={practice.imageHint}
              loading="lazy"
            />
          ) : (
            <Image
              src={displayImageUrl} // Fallback to placehold.co or if explicitly set to it
              alt={displayImageAlt}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={practice.imageHint}
            />
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-md font-headline mb-1 leading-tight group-hover:text-primary transition-colors">
              {practice.title}
            </CardTitle>
            {/* <Badge variant="outline" className="text-xs shrink-0">{practice.type}</Badge> */}
          </div>
          <CardDescription className="text-xs text-muted-foreground line-clamp-1">
             {practice.category}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow py-2">
          <p className="text-sm text-muted-foreground line-clamp-3">{practice.summary}</p>
        </CardContent>
        <CardFooter className="pt-2 pb-4 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-primary group-hover:underline flex items-center">
            Read More <ArrowRight className="ml-1 h-4 w-4" />
          </span>
          {practice.publishedAt && (
            <div className="text-xs text-muted-foreground mt-2 sm:mt-0 flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              {formatDate(practice.publishedAt)}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
