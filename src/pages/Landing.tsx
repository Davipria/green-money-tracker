
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Target, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Tracking Completo",
      description: "Monitora tutte le tue scommesse con statistiche dettagliate"
    },
    {
      icon: BarChart3,
      title: "Analisi Avanzate",
      description: "Grafici e report per ottimizzare le tue strategie"
    },
    {
      icon: Target,
      title: "Gestione Bankroll",
      description: "Controlla il tuo budget e massimizza i profitti"
    },
    {
      icon: Shield,
      title: "Sicurezza Totale",
      description: "I tuoi dati sono protetti e crittografati"
    },
    {
      icon: Zap,
      title: "Interfaccia Veloce",
      description: "Aggiungi scommesse rapidamente e facilmente"
    },
    {
      icon: Users,
      title: "Multi-Tipster",
      description: "Traccia le performance di diversi tipster"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">BetTracker Pro</h1>
          </div>
          <Link to="/auth">
            <Button>Inizia Ora</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Nuovo 2024
        </Badge>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Il Tuo Tracker di Scommesse Professionale
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Monitora, analizza e ottimizza le tue scommesse sportive con il software più avanzato del mercato. 
          Gestisci il tuo bankroll come un professionista.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="text-lg">
              Registrati Gratis
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-lg">
            Scopri le Funzionalità
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Perché Scegliere BetTracker Pro?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tutte le funzionalità di cui hai bisogno per diventare uno scommettitore di successo
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">Scommesse Monitorate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Accuratezza Tracking</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-lg opacity-90">Supporto Clienti</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto a Iniziare?</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Unisciti a migliaia di scommettitori che hanno migliorato i loro risultati con BetTracker Pro
        </p>
        <Link to="/auth">
          <Button size="lg" className="text-lg">
            Crea il Tuo Account Gratuito
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">BetTracker Pro</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 BetTracker Pro. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
