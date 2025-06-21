
'use client';

import type { FarmingCalendarOutput, CalendarEvent } from '@/ai/flows/farming-calendar-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarCheck, Info, AlertTriangle, Sparkles, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface FarmingCalendarDisplayProps {
  result: FarmingCalendarOutput | null;
  loading: boolean;
  error: string | null;
}

const formatDateRange = (startDateStr: string, endDateStr?: string) => {
  try {
    const startDate = parseISO(startDateStr);
    let dateText = format(startDate, "MMM d, yyyy");
    if (endDateStr) {
      const endDate = parseISO(endDateStr);
      if (format(startDate, "yyyy-MM-dd") !== format(endDate, "yyyy-MM-dd")) {
         dateText += ` - ${format(endDate, "MMM d, yyyy")}`;
      }
    }
    return dateText;
  } catch (e) {
    console.error("Date parsing/formatting error:", e);
    return `${startDateStr}${endDateStr ? ' - ' + endDateStr : ''}`;
  }
};

const getCategoryBadgeVariant = (category: CalendarEvent['category']): "default" | "secondary" | "destructive" | "outline" => {
  switch (category) {
    case 'Harvesting':
    case 'Post-Harvest':
      return 'default'; // Primary color for completion
    case 'Preparation':
    case 'Planting':
      return 'secondary';
    case 'Pest & Disease Management':
    case 'Weed Control':
      return 'destructive';
    case 'Fertilization':
    case 'Irrigation':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function FarmingCalendarDisplay({ result, loading, error }: FarmingCalendarDisplayProps) {
  if (loading) {
    return (
        <Card className="shadow-lg animate-pulse">
            <CardHeader>
                <div className="h-6 bg-muted rounded w-3/5 mb-1"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Desktop skeleton */}
                <div className="hidden md:block border rounded-md">
                    <div className="h-12 bg-muted/50 border-b"></div>
                    <div className="p-4 space-y-3">
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-8 bg-muted rounded"></div>
                    </div>
                </div>
                {/* Mobile skeleton */}
                <div className="md:hidden space-y-4">
                     <div className="h-24 bg-muted rounded-lg"></div>
                     <div className="h-24 bg-muted rounded-lg"></div>
                </div>
            </CardContent>
        </Card>
    );
  }
  
  if (error) {
    return (
        <Card className="shadow-lg border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Error Generating Calendar
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive" className="border-0">
                    <AlertDescription className="text-sm leading-normal">{error}</AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  if (!result || !result.schedule || result.schedule.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarCheck className="mr-2 h-5 w-5 text-primary" />
            Farming Schedule
          </CardTitle>
          <CardDescription>Your personalized farming calendar will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground leading-normal">Enter details in the form to generate your farming schedule.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarCheck className="mr-2 h-5 w-5 text-primary" />
          Farming Calendar for {result.cropName}
        </CardTitle>
        <CardDescription>
          Location: {result.location} | Approx. Planting: {formatDateRange(result.plantingDate)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Desktop View: Table */}
        <div className="hidden md:block">
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Date(s)</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.schedule.map((event, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{formatDateRange(event.startDate, event.endDate)}</TableCell>
                                <TableCell>{event.eventName}</TableCell>
                                <TableCell>
                                    <Badge variant={getCategoryBadgeVariant(event.category)}>{event.category}</Badge>
                                </TableCell>
                                <TableCell>{event.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden space-y-4">
            {result.schedule.map((event, index) => (
                <Card key={index} className="bg-muted/50">
                    <CardHeader className="pb-3">
                        <CardTitle>{event.eventName}</CardTitle>
                        <CardDescription>{formatDateRange(event.startDate, event.endDate)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm leading-normal">{event.description}</p>
                        <Badge variant={getCategoryBadgeVariant(event.category)}>{event.category}</Badge>
                    </CardContent>
                </Card>
            ))}
        </div>

        {result.generalAdvice && (
          <Alert variant="default" className="mt-6 bg-accent/50 border-accent">
            <MessageSquare className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary text-base leading-snug">General Advice</AlertTitle>
            <AlertDescription className="text-sm whitespace-pre-line leading-normal">{result.generalAdvice}</AlertDescription>
          </Alert>
        )}

        <Alert variant="default" className="mt-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold text-primary text-base leading-snug">Disclaimer</AlertTitle>
          <AlertDescription className="text-xs leading-normal">
            This farming calendar is AI-generated and provides general guidance. Actual timings may vary based on specific micro-climatic conditions, soil health, pest/disease pressure, and chosen crop variety. Always adapt to your local conditions and consult with local agricultural experts.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
