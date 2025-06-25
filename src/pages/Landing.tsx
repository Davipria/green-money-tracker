import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Target, Shield, Zap, Users, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
const Landing = () => {
  const features = [{
    icon: TrendingUp,
    title: "Tracking Completo",
    description: "Monitora tutte le tue scommesse con statistiche dettagliate",
    color: "from-green-500 to-emerald-600"
  }, {
    icon: BarChart3,
    title: "Analisi Avanzate",
    description: "Grafici e report per ottimizzare le tue strategie",
    color: "from-blue-500 to-indigo-600"
  }, {
    icon: Target,
    title: "Gestione Bankroll",
    description: "Controlla il tuo budget e massimizza i profitti",
    color: "from-purple-500 to-pink-600"
  }, {
    icon: Shield,
    title: "Sicurezza Totale",
    description: "I tuoi dati sono protetti e crittografati",
    color: "from-orange-500 to-red-600"
  }, {
    icon: Zap,
    title: "Interfaccia Veloce",
    description: "Aggiungi scommesse rapidamente e facilmente",
    color: "from-yellow-500 to-orange-500"
  }, {
    icon: Users,
    title: "Multi-Tipster",
    description: "Traccia le performance di diversi tipster",
    color: "from-teal-500 to-cyan-600"
  }];
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BetTracker Pro
            </h1>
          </div>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              Accedi
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Il Tuo Tracker di<br />Scommesse Professionale
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Monitora, analizza e ottimizza le tue scommesse sportive con il software più avanzato del mercato. 
            Gestisci il tuo bankroll come un professionista e massimizza i tuoi risultati.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?signup=true">
              <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Registrati Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300" onClick={scrollToFeatures}>
              Scopri le Funzionalità
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features-section" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Perché Scegliere BetTracker Pro?
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Tutte le funzionalità di cui hai bisogno per diventare uno scommettitore di successo
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => <Card key={index} className="group text-center hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-105">
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">I Vantaggi Concreti</h2>
            <p className="text-blue-100 text-lg">La differenza che fa la differenza</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold mb-3 text-green-300">+35%</div>
              <div className="text-lg text-blue-100 mb-2">Aumento Profitti</div>
              <div className="text-sm text-blue-200">Media degli utenti che usano le nostre analisi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold mb-3 text-yellow-300">-60%</div>
              <div className="text-lg text-blue-100 mb-2">Perdite Ridotte</div>
              <div className="text-sm text-blue-200">Grazie al controllo del bankroll intelligente</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold mb-3 text-blue-300">3x</div>
              <div className="text-lg text-blue-100 mb-2">Velocità di Analisi</div>
              <div className="text-sm text-blue-200">Rispetto ai metodi tradizionali di tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Pronto a Iniziare?
          </h2>
          <p className="text-gray-600 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Unisciti a migliaia di scommettitori che hanno migliorato i loro risultati con BetTracker Pro
          </p>
          <Link to="/auth?signup=true">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              Crea il Tuo Account Gratuito
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BetTracker Pro
            </span>
          </div>
          <p className="text-gray-600">
            © 2024 BetTracker Pro. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>;
};
export default Landing;
