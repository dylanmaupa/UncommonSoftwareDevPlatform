import type { ReactNode } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}

export default function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <Card className="rounded-2xl border-border bg-sidebar">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-1 text-xl text-foreground heading-font">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-2 text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  );
}
