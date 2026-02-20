import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { authService, coursesData, progressService } from '../../services/mockData';
import dashboardAvatar from '../../../assets/avatar2.png';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChevronRight,
  Ellipsis,
  Flame,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

interface DashboardMainProps {
  nickname: string;
  xp: number;
  level: number;
  streak: number;
  completedLessons: number;
  nextCourse: (typeof coursesData)[number];
}

function DashboardMain({
  nickname,
  xp,
  level,
  streak,
  completedLessons,
  nextCourse,
}: DashboardMainProps) {
  const getCourseImage = (title: string) => {
    const normalized = title.toLowerCase();

    if (normalized.includes('python')) {
      return 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1000&q=80';
    }
    if (normalized.includes('react')) {
      return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1000&q=80';
    }
    if (normalized.includes('javascript') || normalized.includes('node')) {
      return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80';
    }
    if (normalized.includes('ui') || normalized.includes('ux') || normalized.includes('design')) {
      return 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=80';
    }

    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';
  };
  const featuredCourses = coursesData.slice(0, 3);

  return (
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] p-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                defaultValue=""
                placeholder="Search your course..."
                className="h-10 w-full rounded-full border border-[rgba(0,0,0,0.08)] bg-white pl-9 pr-3 text-sm text-[#1a1a2e] outline-none"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-[#6B7280]">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-[rgba(0,0,0,0.08)] bg-white text-[#6B7280]">
              <Sparkles className="h-4 w-4" />
            </Button>
            <div className="ml-auto flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-2 py-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={dashboardAvatar} alt={nickname} />
                <AvatarFallback>{nickname[0]}</AvatarFallback>
              </Avatar>
              <span className="pr-2 text-sm text-[#1a1a2e]">{nickname}</span>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#8B5CF6]">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-wider text-white/80">Online Course</p>
              <h2 className="mt-2 max-w-md text-3xl leading-tight text-white heading-font">
                Sharpen Your Skills with Professional Online Courses
              </h2>
              <p className="mt-2 text-sm text-white/80">Continue with: {nextCourse.title}</p>
              <Button className="mt-5 rounded-full bg-white text-[#1a1a2e] hover:bg-white/90">
                Join Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-[#6B7280]">24 watched</p>
                  <p className="text-sm text-[#1a1a2e]">UI/UX Design</p>
                </div>
                <Target className="h-4 w-4 text-[#6B7280]" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-[#6B7280]">24 watched</p>
                  <p className="text-sm text-[#1a1a2e]">Branding</p>
                </div>
                <Flame className="h-4 w-4 text-[#6B7280]" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-[#6B7280]">40 watched</p>
                  <p className="text-sm text-[#1a1a2e]">Front End</p>
                </div>
                <BookOpen className="h-4 w-4 text-[#6B7280]" />
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg text-[#1a1a2e] heading-font">Continue Watching</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#6B7280]">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                  <CardContent className="space-y-3 p-3">
                    <img
                      src={getCourseImage(course.title)}
                      alt={course.title}
                      className="h-24 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="line-clamp-2 text-sm text-[#1a1a2e]">{course.title}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">{course.difficulty}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#6B7280]">{progressService.getCourseProgress(course.id)}% complete</p>
                      <span className="text-sm">{course.icon}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] px-4 py-3">
                <h3 className="text-lg text-[#1a1a2e] heading-font">Your Lesson</h3>
                <Link to="/courses" className="text-xs text-[#6B7280] hover:text-[#1a1a2e]">See all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="text-xs text-[#6B7280]">
                      <th className="px-4 py-3 font-medium">Mentor</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Desc</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[rgba(0,0,0,0.08)] text-sm text-[#1a1a2e]">
                      <td className="px-4 py-3">Padhang Satrio</td>
                      <td className="px-4 py-3">UI/UX Design</td>
                      <td className="px-4 py-3">Understand of UI/UX Design</td>
                      <td className="px-4 py-3">
                        <Button size="sm" className="h-8 rounded-full bg-[#0747a1] px-3 text-white hover:bg-[#0747a1]/90">
                          Start
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-[#1a1a2e] heading-font">Statistic</h3>
                <Ellipsis className="h-4 w-4 text-[#6B7280]" />
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border border-[rgba(0,0,0,0.08)]">
                  <AvatarImage src={dashboardAvatar} alt={nickname} />
                  <AvatarFallback>{nickname[0]}</AvatarFallback>
                </Avatar>
                <p className="mt-3 text-base text-[#1a1a2e]">Good Morning {nickname}</p>
                <p className="text-xs text-[#6B7280]">Continue your journey to your target</p>
              </div>
              <div className="rounded-2xl bg-[#F5F5FA] p-3">
                <div className="mb-2 flex items-end gap-2">
                  <div className="h-8 w-8 rounded-md bg-[#8B5CF6]/30" />
                  <div className="h-12 w-8 rounded-md bg-[#8B5CF6]/70" />
                  <div className="h-9 w-8 rounded-md bg-[#8B5CF6]/40" />
                  <div className="h-14 w-8 rounded-md bg-[#8B5CF6]" />
                  <div className="h-8 w-8 rounded-md bg-[#8B5CF6]/30" />
                </div>
                <div className="flex justify-between text-[10px] text-[#6B7280]">
                  <span>10-10 Aug</span>
                  <span>11-20 Aug</span>
                  <span>21-30 Aug</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">XP: {xp}</div>
                <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">Level: {level}</div>
                <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">Streak: {streak}</div>
                <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">Lessons: {completedLessons}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-[#1a1a2e] heading-font">Your mentor</h3>
                <Users className="h-4 w-4 text-[#6B7280]" />
              </div>
              {[
                'Padhang Satrio',
                'Zakir Horizontal',
                'Leonardo Samuel',
              ].map((mentor) => (
                <div key={mentor} className="flex items-center justify-between rounded-xl bg-[#FAFAFA] p-2">
                  <div>
                    <p className="text-sm text-[#1a1a2e]">{mentor}</p>
                    <p className="text-xs text-[#6B7280]">Mentor</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 rounded-full border border-[rgba(0,0,0,0.08)] text-xs text-[#6B7280]">
                    Follow
                  </Button>
                </div>
              ))}
              <Button variant="ghost" className="w-full rounded-full bg-[#F5F5FA] text-[#6B7280] hover:bg-[#F5F5FA]">
                See All
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = authService.getCurrentUser();

  if (!user) return null;

  const totalLessons = user.completedLessons.length;

  const coursesWithProgress = coursesData.map(course => ({
    ...course,
    progress: progressService.getCourseProgress(course.id),
  }));

  const inProgressCourses = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  const nextCourse = inProgressCourses[0] || coursesData[0];

  return (
    <DashboardLayout>
      <DashboardMain
        nickname={user.nickname}
        xp={user.xp}
        level={user.level}
        streak={user.streak}
        completedLessons={totalLessons}
        nextCourse={nextCourse}
      />
    </DashboardLayout>
  );
}
