import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}

export default function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500/70 via-sky-500/70 to-cyan-500/70" />
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 transition group-hover:bg-blue-500/15 dark:text-blue-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
