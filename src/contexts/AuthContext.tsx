
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db, getDoc, doc } from '@/lib/firebase';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  contactNumber?: string;
  otherDetails?: string;
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
            otherDetails: data.otherDetails,
          });
        } else {
          // User exists in auth but not in Firestore, create a basic profile
           setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User', // Fallback
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentAuthUser) => {
      setFirebaseUserInternal(currentAuthUser);
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
    if (!isAuthenticating && !loading && !user && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password' && pathname !== '/') {
      router.push('/login');
    }
  }, [user, loading, isAuthenticating, router, pathname]);
  
  if (isAuthenticating || loading) {
     return (
        <div className="flex h-screen w-screen items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
  }

  if (!user && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password' && pathname !== '/') {
    return null; 
  }

  return <>{children}</>;
};
