
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Leaf, LogOut, Menu, UserSquare } from 'lucide-react';
import { signOut } from 'firebase/auth';

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log out. Please try again.' });
    }
  };
  
  const userInitials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="link" asChild className="p-0 h-auto">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold font-headline text-foreground hover:text-primary">AgriAssist</span>
          </Link>
        </Button>
        
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "text-sm",
                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent/50",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={item.disabled}
              aria-label={item.label}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                 <Avatar className="h-9 w-9">
                  {/* <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User'} /> */}
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'My Account'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile">
                  <UserSquare className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
               <SheetHeader className="p-4 border-b">
                 <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetClose asChild>
                  <Button variant="link" asChild className="p-0 h-auto self-start">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <Leaf className="h-7 w-7 text-primary" />
                      <span className="text-xl font-semibold font-headline text-foreground hover:text-primary">AgriAssist</span>
                    </Link>
                  </Button>
                </SheetClose>
              </SheetHeader>
              <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <SheetClose asChild key={item.href}>
                     <Button
                      variant={(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? "secondary" : "ghost"}
                      className="w-full justify-start text-left text-md py-3 h-auto"
                      disabled={item.disabled}
                      aria-label={item.label}
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
              {user && (
                <div className="p-4 border-t mt-auto">
                   <SheetClose asChild>
                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start gap-2 text-md py-3 h-auto">
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
