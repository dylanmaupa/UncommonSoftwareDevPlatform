import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Progress } from '../../../components/ui/progress';
import { supabase } from '../../../../lib/supabase';
import {
  LuArrowLeft,
  LuBookOpen,
  LuAward,
  LuClock,
  LuTarget,
  LuCheckCircle,
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

      // Mock course progress - replace with actual data fetching
      const mockProgress: CourseProgress[] = [
        {
          id: '1',
          title: 'Introduction to Python',
          progress: 75,
          totalLessons: 12,
          completedLessons: 9,
          lastAccessed: '2 days ago',
          icon: '🐍',
        },
        {
          id: '2',
          title: 'React Fundamentals',
          progress: 45,
          totalLessons: 20,
          completedLessons: 9,
          lastAccessed: '5 days ago',
          icon: '⚛️',
        },
        {
          id: '3',
          title: 'Data Structures',
          progress: 30,
          totalLessons: 15,
          completedLessons: 4,
          lastAccessed: '1 week ago',
          icon: '📊',
        },
      ];
      setCourseProgress(mockProgress);

      // Mock achievements
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'First Steps',
          description: 'Completed your first lesson',
          icon: '👣',
          earnedAt: '2024-01-15',
          xpReward: 50,
          rarity: 'common',
        },
        {
          id: '2',
          name: 'Code Warrior',
          description: 'Completed 10 coding exercises',
          icon: '⚔️',
          earnedAt: '2024-02-20',
          xpReward: 150,
          rarity: 'rare',
        },
        {
          id: '3',
          name: 'Python Master',
          description: 'Completed Python course',
          icon: '🐍',
          earnedAt: '2024-03-10',
          xpReward: 300,
          rarity: 'epic',
        },
        {
          id: '4',
          name: '7-Day Streak',
          description: 'Learned for 7 consecutive days',
          icon: '🔥',
          earnedAt: '2024-03-15',
          xpReward: 100,
          rarity: 'rare',
        },
      ];
      setAchievements(mockAchievements);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Student not found</p>
            <Button onClick={() => navigate('/instructor/students')}>
              <LuArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalXP = achievements.reduce((acc, ach) => acc + ach.xpReward, 0);
  const completedCourses = courseProgress.filter(c => c.progress === 100).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/instructor/students')}>
            <LuArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Profile</h1>
            <p className="text-muted-foreground">View detailed student progress and achievements</p>
          </div>
        </div>

        {/* Student Info Card */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={student.avatar_url} className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {student.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{student.full_name}</h2>
                  <Badge className="bg-emerald-500/20 text-emerald-600">Active</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <LuMail className="h-4 w-4" />
                    {student.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <LuBuilding2 className="h-4 w-4" />
                    {student.hub_location || 'No Hub'}
                  </span>
                  <span className="flex items-center gap-1">
                    <LuCalendar className="h-4 w-4" />
                    Joined {new Date(student.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <LuMail className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <LuTarget className="mr-2 h-4 w-4" />
                    Assign Exercise
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <LuZap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <LuBookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Courses</p>
                  <p className="text-2xl font-bold">{courseProgress.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <LuCheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <LuTrophy className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">{achievements.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuBookOpen className="h-5 w-5 text-primary" />
              Course Progress
            </CardTitle>
            <CardDescription>Current enrollment and completion status</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {courseProgress.map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl bg-sidebar border border-border">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    {course.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <Badge variant={course.progress === 100 ? "default" : "outline"}>
                        {course.progress === 100 ? 'Completed' : `${course.progress}%`}
                      </Badge>
                    </div>
                    <Progress value={course.progress} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                      <span className="flex items-center gap-1">
                        <LuClock className="h-3 w-3" />
                        Last accessed {course.lastAccessed}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuAward className="h-5 w-5 text-primary" />
              Achievements & Badges
            </CardTitle>
            <CardDescription>Milestones and accomplishments earned</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-4 p-4 rounded-xl bg-sidebar border border-border">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-2xl ${getRarityColor(achievement.rarity)}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{achievement.name}</h3>
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <LuStar className="h-3 w-3 text-yellow-500" />
                        +{achievement.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <LuCalendar className="h-3 w-3" />
                        {achievement.earnedAt}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submissions Section */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuCode className="h-5 w-5 text-primary" />
              Recent Submissions
            </CardTitle>
            <CardDescription>Exercise and project submissions history</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 rounded-xl bg-sidebar border border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        {submission.type === 'code' ? (
                          <LuCode className="h-5 w-5 text-accent" />
                        ) : (
                          <LuFileText className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{submission.assignment}</p>
                        <p className="text-sm text-muted-foreground">Submitted {submission.submitted}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {submission.score !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                          <LuTrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-medium">{submission.score}%</span>
                        </div>
                      )}
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
