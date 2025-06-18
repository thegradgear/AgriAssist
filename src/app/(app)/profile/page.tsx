
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="container mx-auto">
        <PageHeader title="My Profile" description="View and update your personal information." />
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-1/4 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-10 w-1/4 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-10 w-1/3" />
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
      <div className="max-w-2xl mx-auto">
        <ProfileForm currentUser={user} />
      </div>
    </div>
  );
}
