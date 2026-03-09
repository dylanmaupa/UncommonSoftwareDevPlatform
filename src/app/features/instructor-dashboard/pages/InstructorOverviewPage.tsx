import { Link } from 'react-router';
import {
  LuLayoutGrid,
  LuUsers,
  LuTrendingUp,
  LuTriangleAlert,
  LuArrowRight,
  LuBuilding2,
} from 'react-icons/lu';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Button } from '../../../components/ui/button';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorOverviewPage() {
  const { metrics, hubSummaries, topStudents } = useInstructorData();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground heading-font">Platform Overview</h1>
        <p className="text-muted-foreground">Comprehensive analytics across all learning hubs.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Hubs', value: metrics.totalHubs, icon: LuLayoutGrid, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Students', value: metrics.totalStudents, icon: LuUsers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Platform Progress', value: `${metrics.averageProgress}%`, icon: LuTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Students at Risk', value: metrics.studentsAtRisk, icon: LuTriangleAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border bg-sidebar shadow-sm border-none bg-sidebar/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Hubs Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <LuBuilding2 className="h-5 w-5 text-primary" />
              Regional Hubs
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {hubSummaries.map((summary) => (
              <Card key={summary.hub.id} className="group overflow-hidden rounded-2xl border-border bg-sidebar hover:shadow-md transition-all border-none bg-sidebar/30">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg heading-font">{summary.hub.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{summary.hub.city} • {summary.hub.cohort}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {summary.studentCount} Students
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-2 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Average Progress</span>
                      <span className="font-medium text-foreground">{summary.averageProgress}%</span>
                    </div>
                    <Progress value={summary.averageProgress} className="h-1.5" />
                  </div>

                  <Link
                    to={`/instructor/hubs/${summary.hub.id}`}
                    className="flex w-full items-center justify-between rounded-xl bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-sidebar transition-colors group-hover:bg-primary group-hover:text-white"
                  >
                    View Hub Details
                    <LuArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Performers Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Top Performers</h2>
          <Card className="rounded-2xl border-border bg-sidebar border-none bg-sidebar/50">
            <CardContent className="p-4 space-y-4">
              {topStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{student.fullName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{student.progress.xp} XP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-500">
                      {Math.round((student.progress.completedLessons / student.progress.totalLessons) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full mt-2 rounded-xl border-border hover:bg-sidebar">
                <Link to="/instructor/students">View All Students</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
