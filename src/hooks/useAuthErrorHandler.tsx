
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
            error.code === 'PGRST301') {
          
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
      
      // Call original console.error for other errors
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, [signOut, toast]);
};
