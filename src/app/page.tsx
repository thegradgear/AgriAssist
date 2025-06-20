
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { WhyAgriAssistSection } from '@/components/marketing/WhyAgriAssistSection';
import { CallToActionSection } from '@/components/marketing/CallToActionSection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Skeleton } from '@/components/ui/skeleton'; // For initial loading state

export default function LandingPage() {
  const { loading, isAuthenticating } = useAuth();

  if (loading || isAuthenticating) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* Skeleton for Header */}
        <header className="py-4 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </header>
        {/* Skeleton for Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
            <Skeleton className="h-64 md:h-96 rounded-lg" />
          </div>
        </section>
        {/* Skeleton for Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-1/2 mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card/80 shadow-lg rounded-lg p-6">
                  <Skeleton className="h-10 w-10 mx-auto rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mx-auto" />
                  <Skeleton className="h-4 w-5/6 mx-auto mt-1" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <WhyAgriAssistSection />
        <CallToActionSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
