
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockBets } from "@/data/mockBets";
import { groupBetsByMonth, formatCurrency } from "@/utils/betUtils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const Archive = () => {
  const monthlyStats = groupBetsByMonth(mockBets);
  const [openMonths, setOpenMonths] = useState<string[]>([]);

  const toggleMonth = (monthKey: string) => {
    setOpenMonths(prev => 
      prev.includes(monthKey) 
        ? prev.filter(key => key !== monthKey)
        : [...prev, monthKey]
    );
  };

  const getBetsForMonth = (month: string, year: number) => {
    return mockBets.filter(bet => {
      const betDate = new Date(bet.date);
      const betMonth = betDate.toLocaleDateString('it-IT', { month: 'long' });
      return betMonth === month && betDate.getFullYear() === year;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Archivio Scommesse</h1>
        <p className="text-muted-foreground">
          Storico delle tue scommesse organizzato per mese
        </p>
      </div>

      <div className="space-y-4">
        {monthlyStats.map((month) => {
          const monthKey = `${month.month}-${month.year}`;
          const isOpen = openMonths.includes(monthKey);
          const monthBets = getBetsForMonth(month.month, month.year);

          return (
            <Card key={monthKey}>
              <Collapsible>
                <CollapsibleTrigger 
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full"
                >
                  <CardHeader className="hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <CardTitle className="capitalize">
                          {month.month} {month.year}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            month.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(month.profit)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {month.betsCount} scommesse • {month.winRate.toFixed(1)}% vincite
                          </div>
                        </div>
                        <Badge variant={month.profit >= 0 ? "default" : "destructive"} className={
                          month.profit >= 0 ? "bg-green-100 text-green-800" : ""
                        }>
                          {month.profit >= 0 ? "Positivo" : "Negativo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {monthBets.map((bet) => (
                        <div key={bet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="font-medium">{bet.event}</div>
                                <div className="text-sm text-muted-foreground">
                                  {bet.sport} • {bet.betType} • Quote {bet.odds}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(bet.date).toLocaleDateString('it-IT')}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="font-medium">
                              Puntata: {formatCurrency(bet.stake)}
                            </div>
                            {bet.payout && (
                              <div className="text-sm text-muted-foreground">
                                Vincita: {formatCurrency(bet.payout)}
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}
                                className={bet.status === 'won' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {bet.status === 'won' ? 'Vinta' : bet.status === 'lost' ? 'Persa' : 'In attesa'}
                              </Badge>
                              <span className={`font-bold ${
                                bet.profit && bet.profit > 0 ? 'text-green-600' : 
                                bet.profit && bet.profit < 0 ? 'text-red-600' : 'text-muted-foreground'
                              }`}>
                                {bet.profit ? formatCurrency(bet.profit) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Archive;
