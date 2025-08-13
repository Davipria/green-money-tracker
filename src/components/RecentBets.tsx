import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/betUtils";
import { Target, Banknote, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Bet } from "@/types/bet";

interface RecentBetsProps {
  bets: Bet[];
  onBetClick: (bet: Bet) => void;
}

const RecentBets = memo(({ bets, onBetClick }: RecentBetsProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-6">
        <Link to="/app/archive" className="block hover:opacity-80 transition-opacity">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl">Ultime Scommesse</CardTitle>
          </div>
        </Link>
      </CardHeader>
      <CardContent>
        {bets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">Non hai ancora aggiunto scommesse</p>
            <p className="text-gray-400">Vai alla sezione "Nuova Scommessa" per iniziare.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bets.slice(0, 5).map((bet) => (
              <div key={bet.id} className="group">
                <div 
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 group-hover:border-blue-200 cursor-pointer"
                  onClick={() => onBetClick(bet)}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg mb-1">{bet.event}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-4">
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        {bet.sport || bet.bet_type}
                      </span>
                      <span className="flex items-center">
                        <Banknote className="w-4 h-4 mr-1" />
                        {new Date(bet.date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-semibold text-gray-900 text-lg mb-1">{formatCurrency(bet.stake)}</div>
                    <div className={`text-sm font-medium px-3 py-1 rounded-full text-center ${
                      bet.status === 'won' 
                        ? 'bg-green-100 text-green-800' 
                        : bet.status === 'lost' 
                        ? 'bg-red-100 text-red-800'
                        : bet.status === 'cashout'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bet.status === 'won' ? 'Vinta' : bet.status === 'lost' ? 'Persa' : bet.status === 'cashout' ? 'Cashout' : 'In attesa'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RecentBets.displayName = "RecentBets";

export default RecentBets;