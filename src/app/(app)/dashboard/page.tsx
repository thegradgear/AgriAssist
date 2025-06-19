
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonDashboardCard = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-6 w-3/5" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </CardHeader>
    <CardContent className="flex-grow">
      <Skeleton className="h-4 w-4/5" />
    </CardContent>
    <CardContent className="pt-0">
      <Skeleton className="h-5 w-2/5" />
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticating } = useAuth();
  const features = NAV_ITEMS.filter(item => item.href !== '/dashboard' && item.href !== '/profile');

  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Farmer';
    return name.split(' ')[0];
  };
  
  const displayName = user?.name ? getFirstName(user.name) : (user?.email ? getFirstName(user.email.split('@')[0]) : 'Farmer');

  const ProfileIcon: LucideIcon | undefined = NAV_ITEMS.find(item => item.href === '/profile')?.icon;

  if (authLoading || isAuthenticating) {
    return (
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
            <div className="grid gap-1">
              <Skeleton className="h-9 w-1/2 md:w-1/3" />
              <Skeleton className="h-5 w-3/4 md:w-1/2" />
            </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(features.length + 1)].map((_, index) => (
            <SkeletonDashboardCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title={`Welcome, ${displayName}!`}
        description="Your AgriAssist dashboard for smart farming."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.href} className="h-full flex flex-col hover:border-primary transition-colors hover:shadow-lg rounded-lg">
            <Link href={feature.href} className="flex flex-col flex-grow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium font-headline">{feature.label}</CardTitle>
                <feature.icon className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>
                  Access {feature.label.toLowerCase()} tools and insights.
                </CardDescription>
              </CardContent>
              <CardContent className="pt-0">
                  <div className="text-sm font-medium text-primary flex items-center">
                  Go to {feature.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
        <Card className="h-full flex flex-col hover:border-primary transition-colors hover:shadow-lg rounded-lg">
          <Link href="/profile" className="flex flex-col flex-grow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">My Profile</CardTitle>
              {ProfileIcon ? <ProfileIcon className="h-6 w-6 text-muted-foreground" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>}
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>
                View and update your personal information.
              </CardDescription>
            </CardContent>
            <CardContent className="pt-0">
              <div className="text-sm font-medium text-primary flex items-center">
                Go to Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
