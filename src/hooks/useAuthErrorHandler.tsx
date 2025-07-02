
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useAuthErrorHandler = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Intercept Supabase errors and handle auth-related ones
    const originalError = console.error;
    
    console.error = (...args) => {
      const error = args[0];
      
      // Check if it's a Supabase auth error
      if (error && typeof error === 'object') {
        if (error.message?.includes('JWT expired') || 
            error.message?.includes('Invalid JWT') ||
            error.message?.includes('session_not_found') ||
            error.message?.includes('NOT_FOUND') ||
            error.code === 'PGRST301' ||
            error.code === 'NOT_FOUND') {
          
          console.log('🚪 Authentication error detected, signing out');
          
          toast({
            title: "Sessione scaduta",
            description: "La tua sessione è scaduta. Effettua nuovamente l'accesso.",
            variant: "destructive",
          });
          
          // Sign out the user
          signOut();
          return;
        }
      }
      
      // Check for 404 errors in the error string
      if (typeof error === 'string' && (error.includes('404') || error.includes('NOT_FOUND'))) {
        console.log('🚪 404 error detected, likely session expired, signing out');
        
        toast({
          title: "Sessione scaduta",
          description: "La tua sessione è scaduta. Effettua nuovamente l'accesso.",
          variant: "destructive",
        });
        
        signOut();
        return;
      }
      
      // Call original console.error for other errors
      originalError.apply(console, args);
    };

    // Also intercept fetch errors and unhandled promise rejections
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check for 404 or 401 responses that might indicate session issues
        if ((response.status === 404 || response.status === 401) && 
            args[0]?.toString().includes('supabase')) {
          console.log('🚪 HTTP error detected on Supabase request, checking session');
          
          // Check if user should be authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (!session && window.location.pathname.startsWith('/app')) {
            toast({
              title: "Sessione scaduta",
              description: "La tua sessione è scaduta. Effettua nuovamente l'accesso.",
              variant: "destructive",
            });
            signOut();
          }
        }
        
        return response;
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.log('🌐 Network error detected');
        }
        throw error;
      }
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error && typeof error === 'object' && 
          (error.message?.includes('404') || 
           error.message?.includes('NOT_FOUND') ||
           error.message?.includes('JWT expired') ||
           error.message?.includes('Invalid JWT'))) {
        
        console.log('🚪 Unhandled rejection with auth error, signing out');
        
        toast({
          title: "Sessione scaduta",
          description: "La tua sessione è scaduta. Effettua nuovamente l'accesso.",
          variant: "destructive",
        });
        
        signOut();
        event.preventDefault(); // Prevent the error from being logged
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      window.fetch = originalFetch;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [signOut, toast]);
};
