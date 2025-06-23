
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db, getDoc, doc } from '@/lib/firebase';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  contactNumber?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticating: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticating: true,
  refreshUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [firebaseUserInternal, setFirebaseUserInternal] = useState<FirebaseUser | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: data.name || firebaseUser.displayName,
            contactNumber: data.contactNumber,
          });
        } else {
          // User exists in auth but not in Firestore, create a basic profile
           setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User', // Fallback
          });
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        
        // Check for Firestore offline error and show a toast
        if (error.code === 'unavailable') {
            toast({
                variant: 'destructive',
                title: 'Network Connection Issue',
                description: 'Could not load your latest profile data from the server. Please check your internet connection or Firebase configuration.',
            });
        }

        // Set a basic user profile from auth if Firestore fetch fails
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
        });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
    setIsAuthenticating(false);
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentAuthUser) => {
      setFirebaseUserInternal(currentAuthUser);
      // Set isAuthenticating true when auth state changes, fetchUserProfile will set it false.
      setIsAuthenticating(true); 
      setLoading(true);
      fetchUserProfile(currentAuthUser);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const refreshUserProfile = useCallback(async () => {
    if (firebaseUserInternal) {
      setLoading(true);
      await fetchUserProfile(firebaseUserInternal);
    }
  }, [firebaseUserInternal, fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticating, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAuthenticating } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
    const isPublicMarketingPage = pathname === '/' || pathname === '/privacy-policy' || pathname === '/terms-of-service';

    if (!loading && !isAuthenticating && !user && !isAuthPage && !isPublicMarketingPage) {
      router.push('/login');
    }
  }, [user, loading, isAuthenticating, router, pathname]);
  
  // If still authenticating or loading, the children components (e.g., DashboardPage)
  // will use the 'loading' and 'isAuthenticating' states from useAuth() to render their own skeletons.
  // We don't render a global spinner here anymore.

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const isPublicMarketingPage = pathname === '/' || pathname === '/privacy-policy' || pathname === '/terms-of-service';

  // If loading is finished, and there's no user, and it's a protected page,
  // return null to prevent rendering children while redirection is in progress (handled by useEffect).
  if (!loading && !isAuthenticating && !user && !isAuthPage && !isPublicMarketingPage) {
    return null; 
  }

  // Otherwise, render children. Children are responsible for their own loading UI.
  return <>{children}</>;
};
