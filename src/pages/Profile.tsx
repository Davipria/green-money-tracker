import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { User, Settings, Bell, Shield, Target, TrendingUp, Calendar, Euro } from "lucide-react";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bankroll: number | null;
  bio: string | null;
  favorite_sport: string | null;
  monthly_budget: number | null;
  risk_level: string | null;
  notifications_email: boolean | null;
  notifications_reminders: boolean | null;
  dark_mode: boolean | null;
  show_balance: boolean | null;
}

const Profile = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Sync theme with profile dark_mode setting - only when profile is loaded
  useEffect(() => {
    if (profile && profile.dark_mode !== null) {
      const newTheme = profile.dark_mode ? "dark" : "light";
      if (theme !== newTheme) {
        setTheme(newTheme);
      }
    }
  }, [profile?.dark_mode, theme, setTheme]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Ensure all fields are properly mapped
        const profileData: Profile = {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          bankroll: data.bankroll,
          bio: data.bio,
          favorite_sport: data.favorite_sport,
          monthly_budget: data.monthly_budget,
          risk_level: data.risk_level,
          notifications_email: data.notifications_email,
          notifications_reminders: data.notifications_reminders,
          dark_mode: data.dark_mode,
          show_balance: data.show_balance,
        };
        setProfile(profileData);
      } else {
        // Create profile if it doesn't exist
        const newProfile: Profile = {
          id: user?.id!,
          first_name: user?.user_metadata?.first_name || null,
          last_name: user?.user_metadata?.last_name || null,
          bankroll: 1000.00,
          bio: null,
          favorite_sport: null,
          monthly_budget: 200.00,
          risk_level: 'medium',
          notifications_email: true,
          notifications_reminders: true,
          dark_mode: false,
          show_balance: true,
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        
        // Map the created profile data properly
        const createdProfileData: Profile = {
          id: createdProfile.id,
          first_name: createdProfile.first_name,
          last_name: createdProfile.last_name,
          bankroll: createdProfile.bankroll,
          bio: createdProfile.bio,
          favorite_sport: createdProfile.favorite_sport,
          monthly_budget: createdProfile.monthly_budget,
          risk_level: createdProfile.risk_level,
          notifications_email: createdProfile.notifications_email,
          notifications_reminders: createdProfile.notifications_reminders,
          dark_mode: createdProfile.dark_mode,
          show_balance: createdProfile.show_balance,
        };
        setProfile(createdProfileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          bankroll: profile.bankroll,
          bio: profile.bio,
          favorite_sport: profile.favorite_sport,
          monthly_budget: profile.monthly_budget,
          risk_level: profile.risk_level,
          notifications_email: profile.notifications_email,
          notifications_reminders: profile.notifications_reminders,
          dark_mode: profile.dark_mode,
          show_balance: profile.show_balance,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "✅ Profilo salvato!",
        description: "Le tue impostazioni sono state aggiornate con successo"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il profilo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setProfile(prev => prev ? {...prev, dark_mode: checked} : null);
    setTheme(checked ? "dark" : "light");
  };

  const sportOptions = [
    { value: "calcio", label: "⚽ Calcio" },
    { value: "tennis", label: "🎾 Tennis" },
    { value: "basket", label: "🏀 Basket" },
    { value: "formula1", label: "🏎️ Formula 1" },
    { value: "pallavolo", label: "🏐 Pallavolo" },
    { value: "rugby", label: "🏉 Rugby" },
    { value: "altro", label: "🎯 Altro" }
  ];

  const riskLevels = [
    { value: "low", label: "Conservativo", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Moderato", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "Aggressivo", color: "bg-red-100 text-red-800" }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Il Tuo Profilo
            </h1>
            <p className="text-muted-foreground text-lg">
              Personalizza la tua esperienza di betting
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Badge variant="outline" className="text-sm px-3 py-1">
              📧 {user?.email}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <span>Informazioni Personali</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">Nome</Label>
                  <Input 
                    id="firstName" 
                    value={profile?.first_name || ''} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, first_name: e.target.value} : null)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Cognome</Label>
                  <Input 
                    id="lastName" 
                    value={profile?.last_name || ''} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, last_name: e.target.value} : null)}
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Bio (opzionale)</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Raccontaci qualcosa di te..."
                  value={profile?.bio || ''} 
                  onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport" className="text-sm font-medium">Sport Preferito</Label>
                <select 
                  id="sport"
                  value={profile?.favorite_sport || ''}
                  onChange={(e) => setProfile(prev => prev ? {...prev, favorite_sport: e.target.value} : null)}
                  className="w-full h-11 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleziona uno sport</option>
                  {sportOptions.map((sport) => (
                    <option key={sport.value} value={sport.value}>
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Betting Preferences */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <span>Preferenze di Betting</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankroll" className="text-sm font-medium flex items-center space-x-1">
                    <Euro className="h-4 w-4" />
                    <span>Bankroll Iniziale</span>
                  </Label>
                  <Input 
                    id="bankroll" 
                    type="number" 
                    step="0.01"
                    value={profile?.bankroll || ''} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, bankroll: parseFloat(e.target.value)} : null)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Budget Mensile (€)</span>
                  </Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    step="0.01"
                    value={profile?.monthly_budget || ''} 
                    onChange={(e) => setProfile(prev => prev ? {...prev, monthly_budget: parseFloat(e.target.value)} : null)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Livello di Rischio</span>
                </Label>
                <div className="flex flex-wrap gap-3">
                  {riskLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setProfile(prev => prev ? {...prev, risk_level: level.value} : null)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        profile?.risk_level === level.value 
                          ? level.color + ' ring-2 ring-offset-2 ring-blue-500' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <span>Notifiche</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-xs text-muted-foreground">Aggiornamenti via email</p>
                </div>
                <Switch 
                  checked={profile?.notifications_email || false}
                  onCheckedChange={(checked) => setProfile(prev => prev ? {...prev, notifications_email: checked} : null)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Promemoria</Label>
                  <p className="text-xs text-muted-foreground">Promemoria scommesse</p>
                </div>
                <Switch 
                  checked={profile?.notifications_reminders || false}
                  onCheckedChange={(checked) => setProfile(prev => prev ? {...prev, notifications_reminders: checked} : null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-4 w-4 text-purple-600" />
                </div>
                <span>Visualizzazione</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Tema Scuro</Label>
                  <p className="text-xs text-muted-foreground">Modalità scura</p>
                </div>
                <Switch 
                  checked={profile?.dark_mode || false}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Mostra Saldo</Label>
                  <p className="text-xs text-muted-foreground">Visualizza bankroll</p>
                </div>
                <Switch 
                  checked={profile?.show_balance !== false}
                  onCheckedChange={(checked) => setProfile(prev => prev ? {...prev, show_balance: checked} : null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-4 w-4 text-orange-600" />
                </div>
                <span>Sicurezza</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full h-11 hover:bg-orange-50">
                🔐 Cambia Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={handleSaveProfile} 
          className="px-8 py-3 h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvataggio...
            </>
          ) : (
            <>
              💾 Salva Tutte le Modifiche
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
