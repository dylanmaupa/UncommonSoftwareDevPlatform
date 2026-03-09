import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { 
  LuUsers, 
  LuZap, 
  LuBookOpen, 
  LuCircleAlert,
  LuClock,
  LuTrendingUp,
  LuActivity,
  LuCircleCheck,
  LuTriangle,
  LuChevronRight
} from 'react-icons/lu';

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  exercisesCompleted: number;
  lastActive: string;
  status: 'active' | 'stuck' | 'inactive';
  avatar?: string;
}

interface Submission {
  id: string;
  studentName: string;
  studentAvatar?: string;
  exerciseTitle: string;
  status: 'pending' | 'reviewed' | 'approved';
  submittedAt: string;
}

interface OverviewStats {
  totalStudents: number;
  activeToday: number;
  exercisesCompletedToday: number;
  stuckStudents: number;
  pendingReviews: number;
  averageProgress: number;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats>({
    totalStudents: 120,
    activeToday: 87,
    exercisesCompletedToday: 43,
    stuckStudents: 12,
    pendingReviews: 8,
    averageProgress: 68
  });

  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([
    { id: '1', studentName: 'John Doe', exerciseTitle: 'React Hooks Challenge', status: 'pending', submittedAt: '2h ago' },
    { id: '2', studentName: 'Sarah Smith', exerciseTitle: 'JavaScript Basics Quiz', status: 'reviewed', submittedAt: '4h ago' },
    { id: '3', studentName: 'Mike Johnson', exerciseTitle: 'API Integration Task', status: 'approved', submittedAt: '5h ago' },
    { id: '4', studentName: 'Emily Brown', exerciseTitle: 'CSS Grid Layout', status: 'pending', submittedAt: '6h ago' },
    { id: '5', studentName: 'David Wilson', exerciseTitle: 'State Management', status: 'pending', submittedAt: '8h ago' },
  ]);

  const [stuckStudents, setStuckStudents] = useState<Student[]>([
    { id: '1', name: 'Alex Chen', email: 'alex@example.com', progress: 23, exercisesCompleted: 5, lastActive: '4 days ago', status: 'stuck' },
    { id: '2', name: 'Maria Garcia', email: 'maria@example.com', progress: 31, exercisesCompleted: 8, lastActive: '3 days ago', status: 'stuck' },
    { id: '3', name: 'James Lee', email: 'james@example.com', progress: 45, exercisesCompleted: 12, lastActive: '2 days ago', status: 'inactive' },
  ]);

  const [topPerformers, setTopPerformers] = useState<Student[]>([
    { id: '1', name: 'Jessica Wang', email: 'jessica@example.com', progress: 95, exercisesCompleted: 42, lastActive: '1h ago', status: 'active' },
    { id: '2', name: 'Robert Taylor', email: 'robert@example.com', progress: 89, exercisesCompleted: 38, lastActive: '2h ago', status: 'active' },
    { id: '3', name: 'Lisa Anderson', email: 'lisa@example.com', progress: 87, exercisesCompleted: 36, lastActive: '3h ago', status: 'active' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full">Active</Badge>;
      case 'stuck':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full">Stuck</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300 rounded-full">Reviewed</Badge>;
      case 'approved':
        return <Badge className="bg-blue-600 text-white hover:bg-blue-700 rounded-full">Approved</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="rounded-2xl border-blue-200/60 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none rounded-full mb-2">
                Hub: Harare Cohort
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold">Instructor Dashboard</h1>
              <p className="text-blue-100 mt-1">Monitor students, manage content, and intervene when needed.</p>
            </div>
            <Button className="rounded-full bg-white text-blue-700 hover:bg-blue-50 shadow-sm">
              <LuActivity className="mr-2 h-4 w-4" />
              Send Announcement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="rounded-2xl border-blue-200/60 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Total Students</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStudents}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuUsers className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Registered in hub</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200/60 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Active Today</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeToday}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuActivity className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <LuTrendingUp className="h-3 w-3" /> Engaging now
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200/60 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Completed Today</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.exercisesCompletedToday}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuCircleCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Exercises reviewed</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200/60 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Stuck Students</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.stuckStudents}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuTriangle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">Requires intervention</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200/60 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingReviews}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuClock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Awaiting feedback</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200/60 bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Avg Progress</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.averageProgress}%</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuActivity className="h-5 w-5" />
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${stats.averageProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <Card className="rounded-2xl border-blue-200/60 bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Submissions</CardTitle>
              <CardDescription>Latest work from your students</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full">
              View All <LuChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500">
                    <th className="px-4 py-3 font-medium text-left">Student</th>
                    <th className="px-4 py-3 font-medium text-left">Exercise</th>
                    <th className="px-4 py-3 font-medium text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-left">Submitted</th>
                    <th className="px-4 py-3 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-slate-50 last:border-b-0 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={submission.studentAvatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {submission.studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-slate-900">{submission.studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{submission.exerciseTitle}</td>
                      <td className="px-4 py-3">{getStatusBadge(submission.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{submission.submittedAt}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" className="rounded-full h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                          {submission.status === 'pending' ? 'Review' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Stuck Students & Top Performers */}
        <div className="space-y-6">
          {/* Stuck Students Alert */}
          <Card className="rounded-2xl border-blue-200/60 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <LuCircleAlert className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-900">Students Need Help</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stuckStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.progress}% progress • {student.lastActive}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-full">
                    Reach Out
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-full text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                View All Stuck Students
              </Button>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="rounded-2xl border-blue-200/60 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <LuTrendingUp className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-900">Top Performers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPerformers.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.exercisesCompleted} exercises</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 rounded-full">{student.progress}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights & Alerts */}
      <Card className="rounded-2xl border-blue-200/60 bg-gradient-to-r from-blue-50/50 to-blue-100/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <LuCircleAlert className="h-5 w-5 text-blue-600" />
            Insights & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-blue-100 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <LuTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-900">Exercise 5 Difficult</p>
                <p className="text-xs text-slate-500">32% failure rate</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-blue-100 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <LuClock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-900">8 Inactive Students</p>
                <p className="text-xs text-slate-500">No activity for 7 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-blue-100 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <LuTrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-900">Completion Rate Up</p>
                <p className="text-xs text-slate-500">+12% from last week</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-blue-100 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <LuBookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm text-slate-900">New Module Ready</p>
                <p className="text-xs text-slate-500">React Advanced pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
