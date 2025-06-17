'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function MarketingFooter() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-8 bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <p className="text-sm">
          &copy; {currentYear} AgriAssist. All rights reserved.
        </p>
        <div className="mt-2 space-x-4">
          <Link href="/privacy-policy" legacyBehavior><a className="text-xs hover:text-primary hover:underline">Privacy Policy</a></Link>
          <Link href="/terms-of-service" legacyBehavior><a className="text-xs hover:text-primary hover:underline">Terms of Service</a></Link>
        </div>
      </div>
    </footer>
  );
}
