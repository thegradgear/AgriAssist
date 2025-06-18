
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const features = NAV_ITEMS.filter(item => item.href !== '/dashboard' && item.href !== '/profile');

  // Determine user's first name, or fallback
  const getFirstName = (name: string | null | undefined): string => {
    if (!name) return 'Farmer';
    return name.split(' ')[0];
  };
  
  const displayName = user?.name ? getFirstName(user.name) : (user?.email ? getFirstName(user.email.split('@')[0]) : 'Farmer');

  const ProfileIcon: LucideIcon | undefined = NAV_ITEMS.find(item => item.href === '/profile')?.icon;

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
         {/* Profile Card */}
        <Card className="h-full flex flex-col hover:border-primary transition-colors hover:shadow-lg rounded-lg">
          <Link href="/profile" className="flex flex-col flex-grow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">My Profile</CardTitle>
              {ProfileIcon && <ProfileIcon className="h-6 w-6 text-muted-foreground" />}
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
