import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
}

export function KpiCard({ title, value, icon: Icon, trend, isPositive }: KpiCardProps) {
  return (
    <div className="glassmorphism rounded-xl p-6 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full transition-transform group-hover:scale-150" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-foreground">{value}</h3>
        </div>
        <div className="p-3 bg-surface rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      {trend && (
        <div className="relative z-10 flex items-center text-sm">
          <span className={isPositive ? "text-whatsapp font-medium" : "text-destructive font-medium"}>
            {isPositive ? "+" : "-"}{trend}
          </span>
          <span className="text-muted-foreground ml-2">vs le mois dernier</span>
        </div>
      )}
    </div>
  );
}
