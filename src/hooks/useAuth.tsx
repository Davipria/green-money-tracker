
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, profileType?: 'personal' | 'tipster', username?: string, bankroll?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle successful sign in - redirect to app if on auth page
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Successfully signed in, checking redirect...');
          // Only redirect if we're on the auth page
          if (window.location.pathname === '/auth') {
            console.log('🚀 Redirecting to /app');
            setTimeout(() => {
              window.location.href = '/app';
            }, 100); // Small delay to ensure state is set
          }
        }

        // Handle session expiration or sign out
        if (event === 'SIGNED_OUT' && !session) {
          console.log('🚪 Session expired or signed out');
          if (window.location.pathname.startsWith('/app')) {
            console.log('🚪 Redirecting to login');
            window.location.href = '/auth';
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
        // If there's an error getting the session, clean up and redirect
        if (window.location.pathname.startsWith('/app')) {
          localStorage.removeItem('supabase.auth.token');
          window.location.href = '/auth';
        }
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor session validity periodically
  useEffect(() => {
    if (!session || !user) return;

    const checkSessionValidity = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error || !currentUser) {
          console.log('🚪 Invalid session detected, signing out');
          await signOut();
        }
      } catch (error) {
        console.error('❌ Error checking session validity:', error);
        await signOut();
      }
    };

    // Check session validity every 5 minutes
    const interval = setInterval(checkSessionValidity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session, user]);

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    profileType?: 'personal' | 'tipster',
    username?: string,
    bankroll?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          profile_type: profileType,
          username: username,
          bankroll: bankroll ? parseFloat(bankroll) : undefined,
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user');
      
      // Clean up local storage
      localStorage.removeItem('supabase.auth.token');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset state
      setSession(null);
      setUser(null);
      
      // Redirect to auth page if currently in protected route
      if (window.location.pathname.startsWith('/app')) {
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Force redirect even if sign out fails
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
