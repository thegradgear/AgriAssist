
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button'; // Assuming this is the main Button component
import { cn } from '@/lib/utils';

// This component is assumed to exist if errors are reported from it.
// If it was meant to be removed, the error source is outdated.
// For now, fixing it to work correctly.

export function AppSidebar() {
  const pathname = usePathname();

  if (!NAV_ITEMS || NAV_ITEMS.length === 0) {
    return null; // Or some placeholder if NAV_ITEMS might be undefined/empty
  }

  return (
    <aside className="w-64 bg-card border-r p-4 flex flex-col space-y-2">
      <div className="mb-4">
        {/* Placeholder for Logo or App Name if needed */}
        <Link href="/dashboard" className="flex items-center gap-2 p-2">
            {/* <Leaf className="h-7 w-7 text-primary" /> */} {/* Assuming Leaf icon is available */}
            <span className="text-xl font-semibold font-headline">AgriAssist</span>
        </Link>
      </div>
      <nav className="flex flex-col space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} passHref asChild>
            <Button
              variant={
                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                ? "secondary" 
                : "ghost"
              }
              className="w-full justify-start"
              disabled={item.disabled}
              aria-label={item.label}
              
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
