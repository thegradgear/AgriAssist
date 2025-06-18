
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeaturesSection } from '@/components/marketing/FeaturesSection';
import { CallToActionSection } from '@/components/marketing/CallToActionSection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export default function LandingPage() {
  const { loading, isAuthenticating } = useAuth();
  // The user object is available from useAuth() if needed for conditional rendering
  // directly on this page, but we are no longer using it for redirection from here.

  // Show a global loading spinner only during the initial authentication check.
  // Once that's done, the page content will render.
  if (loading || isAuthenticating) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // If loading and isAuthenticating are false, render the landing page content.
  // The MarketingHeader component is now responsible for showing appropriate auth-related buttons.
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
