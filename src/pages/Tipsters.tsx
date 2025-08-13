import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Target, Calendar, Dice2, Search } from "lucide-react";
import { useTipsters } from "@/hooks/useTipsters";
import { useState } from "react";

export default function Tipsters() {
  const navigate = useNavigate();
  const { tipsters, loading, error } = useTipsters();
  const [search, setSearch] = useState("");

  const handleTipsterClick = (tipsterId: string) => {
    navigate(`/app/tipsters/${tipsterId}`);
  };

  // Filtra i tipster in base al testo di ricerca
  const filteredTipsters = tipsters.filter((tipster) => {
    const searchLower = search.toLowerCase();
    return (
      tipster.username?.toLowerCase().includes(searchLower) ||
      tipster.bio?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Tipster</h1>
          <p className="text-muted-foreground">
            Scopri i migliori tipster e le loro performance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Errore nel caricamento</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Riprova
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tipster</h1>
        <p className="text-muted-foreground">
          Scopri i migliori tipster e le loro performance
        </p>
      </div>

      {/* Campo di ricerca */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Cerca tipster per nome o username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTipsters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun tipster trovato</h3>
            <p className="text-muted-foreground text-center">
              Al momento non ci sono tipster disponibili. Torna più tardi!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTipsters.map((tipster) => (
            <Card 
              key={tipster.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTipsterClick(tipster.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={tipster.avatar_url || ""} />
                    <AvatarFallback>
                     {tipster.username?.charAt(0).toUpperCase() || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {tipster.username || "Tipster"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {tipster.favorite_sport || "Sport preferito non specificato"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="h-4 w-4 text-muted-foreground mr-1" />
                    </div>
                    <p className="text-sm font-medium">{tipster.stats?.totalBets || 0}</p>
                    <p className="text-xs text-muted-foreground">Scommesse</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
                    </div>
                    <p className="text-sm font-medium">
                      {tipster.stats?.winRate ? `${tipster.stats.winRate.toFixed(1)}%` : "0%"}
                    </p>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Dice2 className="h-4 w-4 text-muted-foreground mr-1" />
                    </div>
                    <p className="text-sm font-medium">
                      {tipster.stats?.avgOdds ? tipster.stats.avgOdds.toFixed(2) : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">Quota Media</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                    </div>
                    <p className="text-sm font-medium">
                      {tipster.stats?.profitPercent !== undefined
                        ? `${tipster.stats.profitPercent > 0 ? '+' : ''}${tipster.stats.profitPercent.toFixed(1)}%`
                        : '0.0%'}
                    </p>
                    <p className="text-xs text-muted-foreground">Profitto %</p>
                  </div>
                </div>
                
                {tipster.bio && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground" style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2
                    }}>
                      {tipster.bio}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTipsterClick(tipster.id);
                  }}
                >
                  Visualizza Profilo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
