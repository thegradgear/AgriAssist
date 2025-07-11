
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="container mx-auto">
        <PageHeader title="My Profile" description="View and update your personal information." />
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                    <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-40" />
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
      <div className="max-w-2xl mx-auto space-y-8">
        <ProfileForm currentUser={user} />
        <PasswordChangeForm />
      </div>
    </div>
  );
}
