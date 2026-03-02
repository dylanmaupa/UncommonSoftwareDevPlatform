import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import DataTable, { type DataTableColumn } from '../components/shared/DataTable';
import { useInstructorData } from '../hooks/useInstructorData';
import type { HubSummary } from '../types/instructor.types';

export default function HubsPage() {
  const { hubSummaries } = useInstructorData();

  const columns: Array<DataTableColumn<HubSummary>> = [
    {
      key: 'hub',
      header: 'Hub',
      render: (summary) => (
        <div>
          <p className="font-medium text-foreground">{summary.hub.name}</p>
          <p className="text-xs text-muted-foreground">{summary.hub.city}</p>
        </div>
      ),
    },
    {
      key: 'cohort',
      header: 'Cohort',
      render: (summary) => <span className="text-sm text-foreground">{summary.hub.cohort}</span>,
    },
    {
      key: 'students',
      header: 'Students',
      render: (summary) => (
        <span className="text-sm text-foreground">
          {summary.studentCount}/{summary.hub.capacity}
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'Avg Progress',
      render: (summary) => <span className="text-sm text-foreground">{summary.averageProgress}%</span>,
    },
    {
      key: 'completion',
      header: 'Completion',
      render: (summary) => <span className="text-sm text-foreground">{summary.completionRate}%</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold text-foreground">Hubs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Capacity, attendance, and completion by location.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hubSummaries.map((summary) => (
          <Card key={summary.hub.id} className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{summary.hub.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Cohort: <span className="text-foreground">{summary.hub.cohort}</span></p>
              <p>City: <span className="text-foreground">{summary.hub.city}</span></p>
              <p>
                Student Load: <span className="text-foreground">{summary.studentCount}/{summary.hub.capacity}</span>
              </p>
              <p>Average Progress: <span className="text-foreground">{summary.averageProgress}%</span></p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <DataTable
          data={hubSummaries}
          columns={columns}
          keyExtractor={(summary) => summary.hub.id}
          caption="Operational view across assigned hubs"
        />
      </section>
    </div>
  );
}
