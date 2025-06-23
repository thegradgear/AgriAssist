
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Leaf, LogOut, Menu, UserSquare, Bookmark } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react'; 

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { NAV_ITEMS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const getInitials = (name?: string | null): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
  if (parts.length > 1 && parts[0].length > 0 && parts[parts.length -1].length > 0) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0].length > 0) return parts[0][0].toUpperCase();
  return '?';
};


export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log out. Please try again.' });
    }
  };

  const userInitials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9" suppressHydrationWarning>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
             <SheetHeader className="p-4 border-b">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetClose asChild>
                <Button variant="link" asChild className="p-0 h-auto self-start">
                  <Link href="/" className="flex items-center gap-2">
                    <Leaf className="h-7 w-7 text-primary" />
                    <span className="text-xl font-semibold font-headline text-foreground hover:text-primary">AgriAssist</span>
                  </Link>
                </Button>
              </SheetClose>
            </SheetHeader>
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <SheetClose asChild key={item.href}>
                   <Link
                      href={item.href}
                      className={cn(
                        (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground', 
                        'group flex w-full items-center gap-x-3 rounded-md p-2 text-base font-medium leading-normal justify-start text-left h-auto', // Font style updated here
                        item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                      )}
                      aria-disabled={item.disabled}
                      tabIndex={item.disabled ? -1 : undefined}
                      onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                      aria-label={item.label}
                    >
                      <item.icon
                         className={cn(
                          (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                            ? 'text-accent-foreground' 
                            : 'text-muted-foreground group-hover:text-accent-foreground', 
                          'mr-3 h-5 w-5 shrink-0' 
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="p-4 border-t mt-auto space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Theme</span> 
                    <ThemeToggle />
                 </div>
                 {mounted && user && (
                    <SheetClose asChild>
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-base py-3 h-auto font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"> 
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>Logout</span>
                        </Button>
                    </SheetClose>
                 )}
              </div>
          </SheetContent>
        </Sheet>
        <Button variant="link" asChild className="p-0 h-auto">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold font-headline text-foreground hover:text-primary lg:hidden">AgriAssist</span> 
          </Link>
        </Button>
      </div>

      <div className="hidden lg:flex lg:flex-1"></div>

      <div className="flex items-center gap-3">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                        <Link href="/saved">
                            <Bookmark className="h-5 w-5" />
                            <span className="sr-only">Saved Items</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Saved Items</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

        <div className="hidden lg:flex"> 
          <ThemeToggle />
        </div>
        
        {mounted && user && ( 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" suppressHydrationWarning>
                 <Avatar className="h-9 w-9">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'My Account'}</p> 
                  {user.email && (
                    <p className="text-xs leading-none text-muted-foreground"> 
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="text-sm"> 
                  <UserSquare className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm text-destructive focus:bg-destructive focus:text-destructive-foreground"> 
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
