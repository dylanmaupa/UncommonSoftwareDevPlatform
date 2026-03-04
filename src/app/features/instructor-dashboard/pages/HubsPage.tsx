import { Link } from 'react-router';
import {
  LuArrowRight,
  LuBuilding2,
  LuChevronRight,
  LuTarget,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

export default function HubsPage() {
  const { instructorHub, hubSummary, instructorStudents, topStudents } = useInstructorData();

  if (!instructorHub || !hubSummary) {
    return (
      <div className="p-4 lg:p-6">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 text-center text-muted-foreground">
            No hub is currently assigned to this instructor profile.
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadPercentage = instructorHub.capacity > 0
    ? Math.round((hubSummary.studentCount / instructorHub.capacity) * 100)
    : 0;

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">My Hub</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub.name}</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Your dashboard is focused on this single hub. You can manage learners, progress, and operations here.
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">City</p>
              <p className="mt-1 text-base text-white">{instructorHub.city}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Cohort</p>
              <p className="mt-1 text-base text-white">{instructorHub.cohort}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Students</p>
              <p className="mt-1 text-base text-white">{hubSummary.studentCount}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Capacity</p>
              <p className="mt-1 text-base text-white">{instructorHub.capacity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Hub Load</p>
              <p className="text-sm text-foreground">{loadPercentage}%</p>
            </div>
            <LuBuilding2 className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="text-sm text-foreground">{hubSummary.studentCount}</p>
            </div>
            <LuUsers className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
              <p className="text-sm text-foreground">{hubSummary.averageProgress}%</p>
            </div>
            <LuTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="text-sm text-foreground">{hubSummary.completionRate}%</p>
            </div>
            <LuTarget className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="heading-font text-lg text-foreground">Hub Load & Capacity</h2>
              <p className="text-xs text-muted-foreground">{hubSummary.studentCount}/{instructorHub.capacity} learners enrolled</p>
            </div>
            <Badge className="border border-border bg-sidebar text-[11px] text-muted-foreground">Single Hub</Badge>
          </div>

          <div className="space-y-4 p-4">
            <Progress value={loadPercentage} className="h-2" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link to="/instructor/students">
                <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground">
                  View Hub Students
                  <LuArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/instructor/hub-controls">
                <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground">
                  Open Hub Controls
                  <LuChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-0">
          <div className="border-b border-border px-4 py-3">
            <h2 className="heading-font text-lg text-foreground">Top Students In {instructorHub.name}</h2>
            <p className="text-xs text-muted-foreground">Highest progress learners in your assigned hub</p>
          </div>

          <div className="space-y-2 p-3">
            {topStudents.map((student) => {
              const progress = calculateProgressPercentage(student.progress);
              return (
                <div key={student.id} className="rounded-xl border border-border bg-sidebar p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-foreground">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{progress}%</Badge>
                  </div>
                </div>
              );
            })}

            {instructorStudents.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No students assigned to this hub yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
