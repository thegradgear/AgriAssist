
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r bg-card">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold font-headline text-card-foreground hover:text-primary">AgriAssist</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                          ? 'bg-accent text-accent-foreground' // Active state
                          : 'text-card-foreground hover:bg-accent hover:text-accent-foreground', // Non-active base and hover state
                        'group flex gap-x-3 rounded-md p-2 text-base font-semibold leading-normal items-center', 
                        item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                      )}
                      aria-disabled={item.disabled}
                      tabIndex={item.disabled ? -1 : undefined}
                      onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                    >
                      <item.icon
                        className={cn(
                          (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                            ? 'text-accent-foreground' // Icon color for active link
                            : 'text-muted-foreground group-hover:text-accent-foreground', // Icon color for non-active link
                          'h-5 w-5 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
