'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Lightbulb, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: number;
  type: 'warning' | 'success' | 'suggestion' | 'info';
  message: string;
  created_at: string;
}

export function InsightList() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['vendor-insights'],
    queryFn: async () => {
      const response = await api.get('/vendor/dashboard'); // Assuming the backend returns insights in the dashboard payload
      return response.data.insights || [];
    }
  });

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-whatsapp" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5 text-primary" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBg = (type: Insight['type']) => {
    switch (type) {
      case 'warning': return "bg-amber-500/10 border-amber-500/20 text-amber-200";
      case 'success': return "bg-whatsapp/10 border-whatsapp/20 text-whatsapp";
      case 'suggestion': return "bg-primary/10 border-primary/20 text-primary";
      default: return "bg-blue-500/10 border-blue-500/20 text-blue-200";
    }
  };

  if (isLoading) {
    return <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 w-full bg-surface animate-pulse rounded-xl border border-border" />
      ))}
    </div>;
  }

  if (!insights?.length) {
    return (
      <div className="p-8 text-center bg-surface/50 rounded-2xl border border-dashed border-border mt-2">
        <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-20" />
        <p className="text-sm text-muted-foreground">Aucun conseil pour le moment. Continuez d'ajouter des produits !</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight: Insight) => (
        <div 
          key={insight.id} 
          className={cn(
            "p-4 rounded-2xl border flex items-start space-x-4 transition-all hover:scale-[1.01] duration-300",
            getBg(insight.type)
          )}
        >
          <div className="mt-0.5">{getIcon(insight.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed drop-shadow-sm">{insight.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
