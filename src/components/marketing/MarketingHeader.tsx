
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Leaf, Menu, BarChart3, Calculator, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/shared/ThemeToggle'; 

const navLinks = [
  { href: '#hero', label: 'Home', icon: Home },
  { href: '#features', label: 'Features', icon: BarChart3 },
  { href: '#cta', label: 'Get Started', icon: Calculator },
];

export function MarketingHeader() {
  const { user, loading, isAuthenticating } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading || isAuthenticating) {
    // Basic skeleton for loading state to avoid layout shifts
    return (
      <header className="py-3 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b">
        <div className="container mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary opacity-50 animate-pulse" />
            <span className="text-xl font-semibold font-headline opacity-50">AgriAssist</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Placeholder for theme toggle */}
            <div className="w-9 h-9 bg-muted rounded-md opacity-50"></div> 
            {/* Placeholders for auth buttons */}
            <div className="w-20 h-9 bg-muted rounded-md opacity-50"></div>
            <div className="w-24 h-9 bg-muted rounded-md opacity-50"></div>
          </div>
        </div>
      </header>
    );
  }


  return (
    <header 
      className={`py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? 'bg-background/95 shadow-md backdrop-blur-lg border-b' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Go to AgriAssist homepage">
          <Leaf className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="text-xl font-semibold font-headline group-hover:text-primary transition-colors">AgriAssist</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Button variant="ghost" asChild key={link.label}>
              <Link href={link.href} className="text-foreground/80 hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-md">
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
           {/* Theme Toggle for Desktop */}
          <div className="hidden md:flex">
             <ThemeToggle />
          </div>

          {user ? (
            <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hover:text-primary hover:bg-primary/10">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 flex flex-col bg-background">
                <div className="p-4 border-b">
                  <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-2 group mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                      <Leaf className="h-7 w-7 text-primary group-hover:text-primary/80 transition-colors" />
                      <span className="text-lg font-semibold font-headline group-hover:text-primary transition-colors">AgriAssist</span>
                    </Link>
                  </SheetClose>
                </div>
                <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                  {navLinks.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-md py-3 h-auto"
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href={item.href}>
                          <item.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                          {item.label}
                        </Link>
                      </Button>
                    </SheetClose>
                  ))}
                </nav>
                 {/* Theme Toggle for Mobile Sheet */}
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
