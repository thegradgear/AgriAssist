
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { SavedCostReports } from '@/components/profile/SavedCostReports';
import { SavedIrrigationSchedules } from '@/components/profile/SavedIrrigationSchedules';
import { SavedFarmingCalendars } from '@/components/profile/SavedFarmingCalendars';
import { SavedHealthAnalyses } from '@/components/profile/SavedHealthAnalyses';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Calculator, Droplets, Microscope } from 'lucide-react';

export default function SavedItemsPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="container mx-auto">
        <PageHeader title="My Saved Items" description="Review all your saved reports and analyses." />
        <div className="space-y-8">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="space-y-4 pt-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="My Saved Items"
        description="Review all your saved reports and analyses from various tools in one place."
      />
      <Tabs defaultValue="calendars" className="w-full">
        <TabsList className="flex flex-wrap items-center justify-center md:justify-start gap-3 bg-transparent p-0">
          <TabsTrigger value="calendars" className="rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendars
          </TabsTrigger>
          <TabsTrigger value="costs" className="rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calculator className="mr-2 h-4 w-4" />
            Cost Reports
          </TabsTrigger>
          <TabsTrigger value="irrigation" className="rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Droplets className="mr-2 h-4 w-4" />
            Irrigation
          </TabsTrigger>
          <TabsTrigger value="health" className="rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Microscope className="mr-2 h-4 w-4" />
            Health Analyses
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendars" className="mt-6">
           <SavedFarmingCalendars />
        </TabsContent>
        <TabsContent value="costs" className="mt-6">
          <SavedCostReports />
        </TabsContent>
        <TabsContent value="irrigation" className="mt-6">
          <SavedIrrigationSchedules />
        </TabsContent>
        <TabsContent value="health" className="mt-6">
          <SavedHealthAnalyses />
        </TabsContent>
      </Tabs>
    </div>
  );
}
