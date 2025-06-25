
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface AnimatedStatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

const AnimatedStatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  delay = 0 
}: AnimatedStatsCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card className={`${gradient} border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
    } hover:scale-105 hover:-translate-y-2 relative overflow-hidden group cursor-pointer`}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium mb-1 opacity-90">
              {title}
            </p>
            <p className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">
              {value}
            </p>
            <p className="text-white/70 text-xs opacity-80">
              {subtitle}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative">
            <Icon className="w-6 h-6" />
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
      </CardContent>
    </Card>
  );
};

export default AnimatedStatsCard;
