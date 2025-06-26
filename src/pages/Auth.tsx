import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileType, setProfileType] = useState<'personal' | 'tipster'>('personal');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [bankroll, setBankroll] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if signup parameter is present in URL
    const shouldShowSignup = searchParams.get('signup') === 'true';
    if (shouldShowSignup) {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Errore di accesso",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Accesso effettuato!",
            description: "Benvenuto in BetTracker Pro",
          });
          navigate('/app');
        }
      } else {
        const { error } = await signUp(email, password, firstName, lastName, profileType, username, bankroll);
        if (error) {
          toast({
            title: "Errore di registrazione",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registrazione completata!",
            description: "Controlla la tua email per confermare l'account",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funzione per controllare l'unicità dell'username
  const checkUsernameUnique = async (username: string) => {
    if (!username) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    if (data) {
      setUsernameError('Username già in uso');
    } else {
      setUsernameError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BetTracker Pro
              </span>
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? 'Bentornato! Inserisci le tue credenziali per continuare.'
                : 'Inizia il tuo percorso verso scommesse più intelligenti.'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={!isLogin}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Mario"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Cognome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={!isLogin}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Rossi"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => checkUsernameUnique(username)}
                        required={!isLogin}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="username unico"
                      />
                    </div>
                    {usernameError && (
                      <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="bankroll" className="text-sm font-medium">Bankroll iniziale (€)</Label>
                    <div className="relative">
                      <Input
                        id="bankroll"
                        type="number"
                        min="0"
                        step="0.01"
                        value={bankroll}
                        onChange={(e) => setBankroll(e.target.value)}
                        required={!isLogin}
                        className="pl-4 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="1000.00"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="mario.rossi@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Profile Type Selection - Only for registration */}
              {!isLogin && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tipo di Profilo</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setProfileType('personal')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        profileType === 'personal' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">Personale</div>
                          <div className="text-xs text-gray-500">Per uso privato</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setProfileType('tipster')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        profileType === 'tipster' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">Tipster</div>
                          <div className="text-xs text-gray-500">Per condividere scommesse</div>
                        </div>
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {profileType === 'tipster' 
                      ? 'Il profilo tipster ti permette di condividere le tue scommesse e statistiche con altri utenti.'
                      : 'Il profilo personale mantiene private le tue scommesse e statistiche.'
                    }
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                disabled={loading || !!usernameError}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Caricamento...
                  </div>
                ) : (
                  isLogin ? 'Accedi' : 'Registrati'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {isLogin 
                  ? "Non hai un account? Registrati" 
                  : "Hai già un account? Accedi"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
