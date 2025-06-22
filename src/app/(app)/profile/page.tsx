
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { SavedCostReports } from '@/components/profile/SavedCostReports';
import { SavedIrrigationSchedules } from '@/components/profile/SavedIrrigationSchedules';
import { SavedFarmingCalendars } from '@/components/profile/SavedFarmingCalendars';
import { SavedHealthAnalyses } from '@/components/profile/SavedHealthAnalyses';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="container mx-auto">
        <PageHeader title="My Profile" description="View and update your personal information." />
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <Skeleton className="h-10 w-1/4 mb-4" />
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-10 w-1/4 mb-4" />
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-20 w-full mb-6" />
            <Skeleton className="h-10 w-1/3" />
          </div>
          <Separator />
          <div>
             <Skeleton className="h-8 w-1/2 mb-4" />
             <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="My Profile"
        description="View and update your personal information."
      />
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="max-w-2xl">
          <ProfileForm currentUser={user} />
        </div>
        <Separator />
        <div>
          <h2 className="text-2xl font-semibold font-headline mb-4">Saved Farming Calendars</h2>
          <SavedFarmingCalendars />
        </div>
        <Separator />
        <div>
          <h2 className="text-2xl font-semibold font-headline mb-4">Saved Cost Reports</h2>
          <SavedCostReports />
        </div>
        <Separator />
        <div>
          <h2 className="text-2xl font-semibold font-headline mb-4">Saved Irrigation Schedules</h2>
          <SavedIrrigationSchedules />
        </div>
        <Separator />
        <div>
          <h2 className="text-2xl font-semibold font-headline mb-4">Saved Health Analyses</h2>
          <SavedHealthAnalyses />
        </div>
      </div>
    </div>
  );
}
