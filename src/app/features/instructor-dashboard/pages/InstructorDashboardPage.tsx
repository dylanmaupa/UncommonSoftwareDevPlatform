import { Link } from 'react-router';
import { LuBuilding2, LuTrendingUp, LuTrophy, LuUsers } from 'react-icons/lu';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import HubProgressChart from '../components/charts/HubProgressChart';
import DataTable, { type DataTableColumn } from '../components/shared/DataTable';
import MetricCard from '../components/shared/MetricCard';
import StatusBadge from '../components/shared/StatusBadge';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';
import type { Student } from '../types/instructor.types';

export default function InstructorDashboardPage() {
  const { instructor, metrics, topStudents, chartData } = useInstructorData();

  const studentColumns: Array<DataTableColumn<Student>> = [
    {
      key: 'student',
      header: 'Student',
      render: (student) => (
        <div>
          <p className="font-medium text-foreground">{student.fullName}</p>
          <p className="text-xs text-muted-foreground">{student.email}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (student) => <StatusBadge riskLevel={student.riskLevel} />,
    },
    {
      key: 'progress',
      header: 'Progress',
      className: 'min-w-36',
      render: (student) => {
        const progress = calculateProgressPercentage(student.progress);

        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Lessons</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (student) => (
        <Link
          to={`/instructor/students/${student.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Open profile
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4" id="analytics">
      <header>
        <h1 className="text-3xl font-semibold text-foreground">Instructor Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome, {instructor.fullName}. Monitor learner momentum across your hubs.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Hubs"
          value={metrics.totalHubs}
          subtitle="Hubs currently assigned"
          icon={<LuBuilding2 className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Students"
          value={metrics.totalStudents}
          subtitle="Learners across all hubs"
          icon={<LuUsers className="h-4 w-4" />}
        />
        <MetricCard
          title="Average Progress"
          value={`${metrics.averageProgress}%`}
          subtitle="Lesson completion average"
          icon={<LuTrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="At-Risk Students"
          value={metrics.studentsAtRisk}
          subtitle="Require intervention this week"
          icon={<LuTrophy className="h-4 w-4" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_minmax(0,1fr)]">
        <HubProgressChart data={chartData} />

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">High Performing Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStudents.map((student) => {
              const progress = calculateProgressPercentage(student.progress);

              return (
                <div key={student.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{student.fullName}</p>
                    <span className="text-xs font-semibold text-primary">{student.progress.xp} XP</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={progress} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        <DataTable
          data={topStudents}
          columns={studentColumns}
          keyExtractor={(student) => student.id}
          caption="Students sorted by lesson completion"
        />
      </section>
    </div>
  );
}
