
import { Bet } from "@/types/bet";

export const mockBets: Bet[] = [
  {
    id: "1",
    date: "2024-06-20",
    sport: "Calcio",
    event: "Inter vs Milan",
    betType: "1X2",
    odds: 2.5,
    stake: 50,
    status: "won",
    payout: 125,
    profit: 75,
    notes: "Derby della Madonnina"
  },
  {
    id: "2",
    date: "2024-06-18",
    sport: "Tennis",
    event: "Sinner vs Djokovic",
    betType: "Vincente",
    odds: 3.2,
    stake: 30,
    status: "lost",
    profit: -30,
    notes: "Finale ATP"
  },
  {
    id: "3",
    date: "2024-06-15",
    sport: "Basket",
    event: "Lakers vs Warriors",
    betType: "Over/Under",
    odds: 1.9,
    stake: 40,
    status: "won",
    payout: 76,
    profit: 36,
    notes: "Over 220.5 punti"
  },
  {
    id: "4",
    date: "2024-05-28",
    sport: "Calcio",
    event: "Juventus vs Napoli",
    betType: "1X2",
    odds: 2.1,
    stake: 60,
    status: "lost",
    profit: -60,
    notes: "Serie A"
  },
  {
    id: "5",
    date: "2024-05-25",
    sport: "Tennis",
    event: "Roland Garros",
    betType: "Vincente",
    odds: 4.5,
    stake: 25,
    status: "won",
    payout: 112.5,
    profit: 87.5,
    notes: "Semifinale"
  },
  {
    id: "6",
    date: "2024-05-20",
    sport: "Formula 1",
    event: "GP Monaco",
    betType: "Podio",
    odds: 1.8,
    stake: 35,
    status: "won",
    payout: 63,
    profit: 28,
    notes: "Leclerc podio"
  }
];
