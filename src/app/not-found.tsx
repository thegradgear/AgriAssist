'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground text-center p-4">
      <Frown className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-5xl font-bold font-headline mb-2">404</h1>
      <h2 className="text-2xl font-semibold font-headline mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button asChild size="lg">
        <Link href={user ? '/dashboard' : '/'}>
          {user ? 'Go to Dashboard' : 'Back to Home'}
        </Link>
      </Button>
    </div>
  );
}
