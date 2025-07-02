
import { Badge } from "@/components/ui/badge";
import { BetSelection } from "@/types/bet";
import { formatCurrency } from "@/utils/betUtils";
import { Target } from "lucide-react";

interface BetSelectionsDisplayProps {
  selections: BetSelection[];
}

const BetSelectionsDisplay = ({ selections }: BetSelectionsDisplayProps) => {
  if (!selections || selections.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'won':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            Vinta
          </Badge>
        );
      case 'lost':
        return (
          <Badge variant="destructive">
            Persa
          </Badge>
        );
      case 'void':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
            Annullata
          </Badge>
        );
      case 'cashout':
        return (
          <Badge variant="secondary">
            Cashout
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            In attesa
          </Badge>
        );
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm font-medium text-gray-700 flex items-center">
        <Target className="w-4 h-4 mr-1" />
        Selezioni ({selections.length})
      </div>
      <div className="space-y-2">
        {selections.map((selection) => (
          <div 
            key={selection.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm mb-1">
                {selection.event}
              </div>
              <div className="text-xs text-gray-600 flex items-center space-x-3">
                {selection.sport && (
                  <span className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    {selection.sport}
                  </span>
                )}
                {selection.selection && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {selection.selection}
                  </span>
                )}
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  Quote {selection.odds}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selection.payout && (
                <span className="text-sm font-medium text-gray-700">
                  {formatCurrency(selection.payout)}
                </span>
              )}
              {getStatusBadge(selection.individual_status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BetSelectionsDisplay;
