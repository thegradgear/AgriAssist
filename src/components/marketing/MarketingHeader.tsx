
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export function MarketingHeader() {
  const { user, loading, isAuthenticating } = useAuth(); // Get user and loading states

  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold font-headline">AgriAssist</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {(loading || isAuthenticating) ? (
            <>
              <Button variant="ghost" disabled className="w-20 h-9 animate-pulse bg-muted/50"></Button>
              <Button disabled className="w-24 h-9 animate-pulse bg-muted/50"></Button>
            </>
          ) : user ? (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
