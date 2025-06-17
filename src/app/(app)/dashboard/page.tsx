'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const features = NAV_ITEMS.filter(item => item.href !== '/dashboard');

  return (
    <div className="container mx-auto">
      <PageHeader
        title={`Welcome, ${user?.email?.split('@')[0] || 'Farmer'}!`}
        description="Your AgriAssist dashboard for smart farming."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} legacyBehavior>
            <a className="block hover:shadow-lg transition-shadow duration-200 rounded-lg">
              <Card className="h-full flex flex-col hover:border-primary transition-colors">
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
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
