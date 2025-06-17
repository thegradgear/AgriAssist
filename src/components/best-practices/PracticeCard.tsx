import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export interface Practice {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageUrl: string;
  imageHint: string; // For data-ai-hint
  link: string; // Could be internal or external
  type: 'Article' | 'Case Study' | 'Video Tutorial';
}

interface PracticeCardProps {
  practice: Practice;
}

export function PracticeCard({ practice }: PracticeCardProps) {
  return (
    <Link 
      href={practice.link} 
      target={practice.link.startsWith('http') ? '_blank' : '_self'} 
      rel={practice.link.startsWith('http') ? 'noopener noreferrer' : ''} 
      className="block group"
    >
      <Card className="h-full flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="relative w-full h-48">
          <Image
            src={practice.imageUrl}
            alt={practice.title}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={practice.imageHint}
          />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-headline mb-1 leading-tight">{practice.title}</CardTitle>
            <Badge variant="outline" className="text-xs shrink-0">{practice.type}</Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">{practice.category}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{practice.summary}</p>
        </CardContent>
        <CardFooter>
          <span className="text-sm font-medium text-primary group-hover:underline flex items-center">
            Learn More <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
