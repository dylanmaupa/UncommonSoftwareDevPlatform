import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface HubProgressChartProps {
  data: Array<{
    hubName: string;
    progress: number;
  }>;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0];

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">{point.payload.hubName}</p>
      <p className="text-sm font-medium text-foreground">{point.value}% average progress</p>
    </div>
  );
}

export default function HubProgressChart({ data }: HubProgressChartProps) {
  return (
    <Card className="rounded-2xl border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Average Hub Progress</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="hubName" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
            <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
            <Bar dataKey="progress" radius={[8, 8, 0, 0]} className="fill-primary" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
