'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { CallToActionSection } from '@/components/marketing/CallToActionSection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function LandingPage() {
  const { user, loading, isAuthenticating } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect them from landing page to dashboard
    if (!loading && !isAuthenticating && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, isAuthenticating, router]);

  // Show loading spinner only while checking auth state if user might be redirected
  // Otherwise, if not logged in, we want to show the landing page content immediately.
  if (loading || isAuthenticating) {
    // If not logged in after check, this spinner won't show long, landing page takes over.
    // If logged in, this spinner shows until redirect.
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  // If user is defined, they will be redirected by the useEffect.
  // If user is null (not logged in), show the landing page.
  if (user) {
    // This state should ideally not be reached if redirect works quickly
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MarketingHeader />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CallToActionSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
