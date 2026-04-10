import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Progress } from '../../../components/ui/progress';
import { Progress } from '../../../components/ui/progress';
import { supabase } from '../../../../lib/supabase';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import {
  LuArrowLeft,
  LuBookOpen,
  LuAward,
  LuClock,
  LuTarget,
  LuCircleCheck,
  LuTrendingUp,
  LuCalendar,
  LuMail,
  LuBuilding2,
  LuCode,
  LuFileText,
  LuStar,
  LuTrophy,
  LuZap,
} from 'react-icons/lu';

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  hub_location?: string;
  role: string;
  created_at: string;
  xp?: number;
  level?: number;
}

interface CourseProgress {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  icon?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Submission {
  id: string;
  assignment: string;
  status: 'Pending' | 'Approved' | 'Needs Revision';
  submitted: string;
  score?: number;
  type: string;
}

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      // Fetch student profile
      const { data: studentData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (studentData) {
        setStudent(studentData);
      }

      // Fetch real course progress from user_progress table
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          *,
          course:courses(id, title, icon)
        `)
        .eq('user_id', studentId)
        .eq('item_type', 'course');

      const realProgress: CourseProgress[] = progressData?.map((p: any) => ({
        id: p.course?.id || p.item_id,
        title: p.course?.title || 'Unknown Course',
        progress: p.progress_percentage || 0,
        totalLessons: 0, // Will need to calculate separately
        completedLessons: 0,
        lastAccessed: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Unknown',
        icon: p.course?.icon || '�',
      })) || [];
      setCourseProgress(realProgress);

      // Fetch real achievements from user_achievements table
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', studentId);

      const realAchievements: Achievement[] = achievementsData?.map((ua: any) => ({
        id: ua.achievement?.id || ua.achievement_id,
        name: ua.achievement?.name || 'Unknown Achievement',
        description: ua.achievement?.description || '',
        icon: ua.achievement?.icon || '🏆',
        earnedAt: ua.earned_at || ua.created_at,
        xpReward: ua.achievement?.xp_reward || 0,
        rarity: ua.achievement?.rarity || 'common',
      })) || [];
      setAchievements(realAchievements);

      // Fetch submissions
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(title, type)')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false });
      
      if (submissionsData) {
        const formattedSubmissions = submissionsData.map((sub: any) => ({
          id: sub.id,
          assignment: sub.assignment?.title || 'Unknown Assignment',
          status: sub.status || 'Pending',
          submitted: new Date(sub.created_at).toLocaleDateString(),
          score: sub.score,
          type: sub.assignment?.type || 'code',
        }));
        setSubmissions(formattedSubmissions);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30">Approved</Badge>;
      case 'Needs Revision':
        return <Badge className="bg-amber-500/20 text-amber-600 hover:bg-amber-500/30">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading student profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md rounded-2xl border-border bg-sidebar">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Student not found</p>
              <Button onClick={() => navigate('/instructor/students')} className="rounded-full">
                <LuArrowLeft className="mr-2 h-4 w-4" />
                Back to Students
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const totalXP = achievements.reduce((acc, ach) => acc + ach.xpReward, 0);
  const completedCourses = courseProgress.filter(c => c.progress === 100).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button variant="ghost" size="icon" className="rounded-full border border-border bg-sidebar hover:bg-secondary" onClick={() => navigate('/instructor/students')}>
            <LuArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl text-foreground heading-font lowercase">Student Profile</h1>
            <p className="text-sm text-muted-foreground">View detailed student progress and achievements</p>
          </div>
        </div>

        {/* Student Info Card */}
        <Card className="rounded-2xl border-border bg-sidebar/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-border/50 shadow-sm">
                <AvatarImage src={student.avatar_url} className="object-cover" />
                <AvatarFallback className="text-2xl bg-secondary text-foreground">
                  {student.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 mb-2">
                  <h2 className="text-2xl text-foreground heading-font lowercase">{student.full_name}</h2>
                  <Badge className="bg-success/20 text-success hover:bg-success/30 rounded-full">Active</Badge>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-5">
                  <span className="flex items-center gap-1.5">
                    <LuMail className="h-4 w-4" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-full border border-border/50">
                    <LuBuilding2 className="h-3.5 w-3.5" />
                    {student.hub_location || 'No Hub'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <LuCalendar className="h-4 w-4" />
                    Joined {new Date(student.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <Button variant="outline" size="sm" className="rounded-lg h-9">
                    <LuMail className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="default" size="sm" className="rounded-lg h-9 bg-primary text-primary-foreground hover:bg-primary/90">
                    <LuTarget className="mr-2 h-4 w-4" />
                    Assign Exercise
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border bg-sidebar hover:bg-sidebar/80 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[inset_0_0_10px_rgba(var(--primary),0.2)]">
                  <LuZap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl text-foreground heading-font">{totalXP.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border bg-sidebar hover:bg-sidebar/80 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
                  <LuBookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl text-foreground heading-font">{courseProgress.length}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border bg-sidebar hover:bg-sidebar/80 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center border border-success/20 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]">
                  <LuCircleCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl text-foreground heading-font">{completedCourses}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border bg-sidebar hover:bg-sidebar/80 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-[inset_0_0_10px_rgba(var(--accent),0.2)]">
                  <LuTrophy className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl text-foreground heading-font">{achievements.length}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Badges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Progress Section */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg heading-font lowercase flex items-center gap-2">
                <LuBookOpen className="h-5 w-5 text-primary" />
                Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <div className="space-y-3">
                {courseProgress.length > 0 ? courseProgress.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-3 rounded-xl bg-sidebar border border-border hover:border-primary/30 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shadow-sm">
                      {course.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-medium text-sm text-foreground truncate pl-1">{course.title}</h3>
                        <Badge variant={course.progress === 100 ? "default" : "secondary"} className="text-[10px] uppercase font-semibold h-5">
                          {course.progress === 100 ? 'Completed' : `${course.progress}%`}
                        </Badge>
                      </div>
                      <Progress value={course.progress} className="h-1.5 mb-1.5" />
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                        <span>{course.completedLessons} / {course.totalLessons} lessons</span>
                        <span className="truncate ml-2">Active {course.lastAccessed}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl bg-sidebar/50">
                    No coursework started yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submissions Section */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg heading-font lowercase flex items-center gap-2">
                <LuCode className="h-5 w-5 text-primary" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-sidebar border border-border hover:border-primary/30 transition-colors gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent shadow-[inset_0_0_8px_rgba(var(--accent),0.1)] flex-shrink-0">
                          {submission.type === 'code' ? (
                            <LuCode className="h-5 w-5" />
                          ) : (
                            <LuFileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{submission.assignment}</p>
                          <p className="text-[11px] text-muted-foreground">Submitted {submission.submitted}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {submission.score !== undefined && (
                          <div className="flex items-center gap-1.5 text-xs bg-secondary px-2 py-1 rounded-md border border-border">
                            <LuTrendingUp className="h-3 w-3 text-primary" />
                            <span className="font-semibold">{submission.score}%</span>
                          </div>
                        )}
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl bg-sidebar/50">
                  No submissions yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg heading-font lowercase flex items-center gap-2">
                <LuAward className="h-5 w-5 text-primary" />
                Achievements & Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-xl bg-sidebar border border-border hover:shadow-sm transition-all hover:-translate-y-0.5">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${getRarityColor(achievement.rarity)}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground truncate">{achievement.name}</h3>
                        <Badge className={`px-1.5 py-0 text-[10px] uppercase tracking-wider ${getRarityColor(achievement.rarity).replace('text-white', 'text-white/90')}`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary">
                          <LuStar className="h-3 w-3 text-yellow-500" />
                          +{achievement.xpReward} XP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
