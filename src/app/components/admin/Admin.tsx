import DashboardLayout from '../layout/DashboardLayout';
import { authService, coursesData, projectsData } from '../../services/mockData';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  LuBookOpen,
  LuCircleCheckBig,
  LuClock3,
  LuFolderKanban,
  LuShieldCheck,
  LuUsers,
} from 'react-icons/lu';

const moderationQueue = [
  {
    id: 'MOD-1042',
    title: 'React Fundamentals',
    type: 'Course Update',
    owner: 'Curriculum Team',
    status: 'Pending',
    submitted: '2h ago',
  },
  {
    id: 'MOD-1041',
    title: 'Weather Dashboard',
    type: 'Project Review',
    owner: 'Project Team',
    status: 'In Review',
    submitted: '5h ago',
  },
  {
    id: 'MOD-1038',
    title: 'Python Fundamentals',
    type: 'Curriculum Check',
    owner: 'Learning Ops',
    status: 'Approved',
    submitted: '1d ago',
  },
];

const statusBadgeVariant: Record<(typeof moderationQueue)[number]['status'], 'default' | 'secondary' | 'outline'> = {
  Pending: 'secondary',
  'In Review': 'outline',
  Approved: 'default',
};

export default function Admin() {
  const user = authService.getCurrentUser();

  if (!user) return null;

  const totalLessons = coursesData.reduce(
    (sum, course) => sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0),
    0,
  );
  const completionRate = totalLessons > 0 ? Math.round((user.completedLessons.length / totalLessons) * 100) : 0;
  const pendingProjectReviews = Math.max(projectsData.length - user.completedProjects.length, 0);

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="heading-font text-2xl text-foreground sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track platform health, moderate content, and manage curriculum updates.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <Card className="overflow-hidden rounded-2xl border-border bg-primary">
              <CardContent className="p-4 sm:p-6">
                <p className="text-xs uppercase tracking-wider text-white/80">Operations Overview</p>
                <h2 className="heading-font mt-2 max-w-lg text-2xl leading-tight text-white sm:text-3xl">
                  Keep review queues moving and maintain quality across courses
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button className="rounded-full bg-white text-foreground hover:bg-white/90">Open Review Queue</Button>
                  <Button
                    variant="ghost"
                    className="rounded-full border border-white/30 bg-transparent text-white hover:bg-white/10"
                  >
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-2xl border-border bg-sidebar">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">Courses</p>
                    <LuBookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xl text-foreground">{coursesData.length}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border bg-sidebar">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <LuFolderKanban className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xl text-foreground">{projectsData.length}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border bg-sidebar">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <LuCircleCheckBig className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xl text-foreground">{completionRate}%</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border bg-sidebar">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">Pending Reviews</p>
                    <LuClock3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-xl text-foreground">{pendingProjectReviews}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font text-lg text-foreground">Moderation Queue</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr className="border-y border-border text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">ID</th>
                        <th className="px-4 py-3 font-medium">Title</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Owner</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moderationQueue.map((item) => (
                        <tr key={item.id} className="border-b border-border text-sm text-foreground last:border-b-0">
                          <td className="whitespace-nowrap px-4 py-3">{item.id}</td>
                          <td className="px-4 py-3">{item.title}</td>
                          <td className="whitespace-nowrap px-4 py-3">{item.type}</td>
                          <td className="whitespace-nowrap px-4 py-3">{item.owner}</td>
                          <td className="px-4 py-3">
                            <Badge variant={statusBadgeVariant[item.status]}>{item.status}</Badge>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{item.submitted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="heading-font text-base text-foreground">Admin Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-sidebar p-3">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="mt-1 text-sm text-foreground">{user.nickname}</p>
                </div>
                <div className="rounded-xl bg-sidebar p-3">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="mt-1 text-sm text-foreground">Platform Admin</p>
                </div>
                <div className="rounded-xl bg-sidebar p-3">
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="mt-1 text-sm text-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="heading-font text-base text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start rounded-xl border border-border bg-sidebar">
                  <LuShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                  Review Policy Flags
                </Button>
                <Button variant="ghost" className="w-full justify-start rounded-xl border border-border bg-sidebar">
                  <LuUsers className="mr-2 h-4 w-4 text-muted-foreground" />
                  Manage Users
                </Button>
                <Button variant="ghost" className="w-full justify-start rounded-xl border border-border bg-sidebar">
                  <LuBookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  Publish Curriculum
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
