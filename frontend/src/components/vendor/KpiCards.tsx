import { BarChart3, Package, Users, Zap } from "lucide-react";
import { KpiCard } from "@/components/vendor/KpiCard";

interface DashboardOverviewProps {
  kpis: {
    total_products: { value: number; label: string };
    views: { value: number; trend: { type: string; formatted: string }; label: string };
    leads: { value: number; trend: { type: string; formatted: string }; label: string };
    conversion_rate: { value: number; trend: { type: string; formatted: string }; label: string };
  };
}

export function KpiCards({ kpis }: DashboardOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KpiCard 
        title={kpis.views.label} 
        value={kpis.views.value.toLocaleString()} 
        icon={Zap} 
        trend={kpis.views.trend.formatted} 
        isPositive={kpis.views.trend.type === 'increase'} 
      />
      <KpiCard 
        title={kpis.leads.label} 
        value={kpis.leads.value.toLocaleString()} 
        icon={Users} 
        trend={kpis.leads.trend.formatted} 
        isPositive={kpis.leads.trend.type === 'increase'} 
      />
      <KpiCard 
        title={kpis.conversion_rate.label} 
        value={`${kpis.conversion_rate.value}%`} 
        icon={BarChart3} 
        trend={kpis.conversion_rate.trend.formatted} 
        isPositive={kpis.conversion_rate.trend.type === 'increase'} 
      />
      <KpiCard 
        title={kpis.total_products.label} 
        value={kpis.total_products.value} 
        icon={Package} 
      />
    </div>
  );
}
