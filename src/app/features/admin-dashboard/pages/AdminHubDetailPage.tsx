import { useParams, Link } from 'react-router';
import {
  LuArrowLeft,
  LuUsers,
  LuTrendingUp,
  LuBuilding2,
} from 'react-icons/lu';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { useAdminData } from '../hooks/useAdminData';

export default function AdminHubDetailPage() {
  const { hubId } = useParams();
  const { getHubById, getStudentsByHubId } = useAdminData();

  const hub = getHubById(hubId || '');
  const students = getStudentsByHubId(hubId || '');

  if (!hub) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <p className="text-muted-foreground">Hub not found.</p>
        <Link to="/admin" className="text-primary hover:underline">Return to Overview</Link>
      </div>
    );
  }

  const averageProgress = students.length 
    ? Math.round(students.reduce((acc, s) => {
        const p = Math.round((s.progress.completedLessons / s.progress.totalLessons) * 100);
        return acc + p;
      }, 0) / students.length)
    : 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <Link to="/admin" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
          <LuArrowLeft className="h-4 w-4" />
          Back to Platform Overview
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground heading-font">{hub.name}</h1>
            <p className="text-muted-foreground">{hub.city} • {hub.cohort} Cohort</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
            {students.length} Enrolled Students
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-none bg-sidebar/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <LuUsers className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Headcount</p>
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-sidebar/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-full bg-emerald-500/10 p-3">
              <LuTrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Avg. Progress</p>
              <p className="text-2xl font-bold text-foreground">{averageProgress}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none bg-sidebar/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-full bg-purple-500/10 p-3">
              <LuBuilding2 className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Capacity</p>
              <p className="text-2xl font-bold text-foreground">{hub.capacity}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none bg-sidebar/30">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-xl heading-font">Student Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Risk Level</th>
                  <th className="px-6 py-4 font-semibold">Progress</th>
                  <th className="px-6 py-4 font-semibold text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {students.map((student) => {
                  const progress = Math.round((student.progress.completedLessons / student.progress.totalLessons) * 100);
                  return (
                    <tr key={student.id} className="hover:bg-sidebar/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                            <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`border-none ${
                          student.riskLevel === 'on-track' ? 'bg-emerald-500/10 text-emerald-500' :
                          student.riskLevel === 'needs-attention' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-rose-500/10 text-rose-500'
                        }`}>
                          {student.riskLevel.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 w-40">
                          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                progress > 80 ? 'bg-emerald-500' : 
                                progress > 50 ? 'bg-blue-500' : 
                                'bg-muted-foreground'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-foreground">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-muted-foreground">
                        {student.progress.xp}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
