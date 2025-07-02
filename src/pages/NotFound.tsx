
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // If user is trying to access a protected route and gets 404, it might be a session issue
    if (location.pathname.startsWith('/app') && user) {
      console.log('🚪 404 on protected route, checking session validity');
      
      // Check if this might be a session issue
      setTimeout(() => {
        toast({
          title: "Errore di sessione",
          description: "Si è verificato un problema con la tua sessione. Effettua nuovamente l'accesso.",
          variant: "destructive",
        });
        signOut();
      }, 2000); // Give user time to see the 404 page
    }
  }, [location.pathname, user, signOut, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Pagina non trovata</p>
        <div className="space-y-2">
          <a href="/" className="block text-blue-500 hover:text-blue-700 underline">
            Torna alla Home
          </a>
          {user && (
            <button
              onClick={() => navigate('/app')}
              className="block w-full text-blue-500 hover:text-blue-700 underline"
            >
              Vai alla Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
