
'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MarketingFooter() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-8 md:py-12 bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold font-headline text-foreground">AgriAssist</span> {/* Logo text in footer */}
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-left leading-normal"> {/* Footer text */}
            &copy; {currentYear} AgriAssist. All rights reserved.
            <br className="sm:hidden"/>
            <span className="hidden sm:inline"> | </span>
            Empowering the future of agriculture.
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors leading-normal"> {/* Footer links */}
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors leading-normal">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
