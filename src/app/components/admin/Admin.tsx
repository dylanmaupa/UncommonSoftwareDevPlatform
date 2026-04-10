import { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import StreakWidget from '../dashboard/StreakWidget';
// @ts-ignore
import dashboardAvatar from '../../../assets/avatar2.png';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { calculateUserLevel } from '../../../lib/gamificationUtils';
import { getGreeting } from '../../lib/timeUtils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  LuBell,
  LuBookOpen,
  LuBuilding2,
  LuCheck,
  LuClock3,
  LuEllipsis,
  LuFolderKanban,
  LuKey,
  LuLayoutDashboard,
  LuMegaphone,
  LuSearch,
  LuSettings,
  LuSparkles,
  LuTarget,
  LuTriangle,
  LuUsers,
  LuX,
  LuZap,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../lib/profileAccess';

import { Link } from 'react-router';
import SubmissionsPage from '../../features/instructor-dashboard/pages/SubmissionsPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { HUB_LOCATIONS } from '../auth/AccountSetup';
import { updateProfileForAuthUser } from '../../lib/profileAccess';
import { toast } from 'sonner';

const instructorSections = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LuLayoutDashboard,
    stage: 'MVP',
    purpose: 'Immediate situational awareness for instructors.',
    features: ['KPI widgets', 'Insights & alerts', 'Recent submissions'],
    teachingValue: ['Dashboard-level analytics', 'Fast read model design'],
  },
  {
    id: 'students',
    label: 'Students',
    icon: LuUsers,
    stage: 'Intermediate',
    purpose: 'Track learner outcomes by person.',
    features: ['Student profiles', 'Progress tracking', 'Status flags'],
    teachingValue: ['One-to-many relationships', 'Conditional rendering'],
  },
  {
    id: 'assignments',
    label: 'Exercises',
    icon: LuKey,
    stage: 'MVP',
    purpose: 'Create structured exercises and deadlines.',
    features: ['Exercises per lesson', 'Difficulty levels', 'Deadlines'],
    teachingValue: ['Data modeling for assessment', 'Time-based logic'],
  },
  {
    id: 'submissions',
    label: 'Submissions',
    icon: LuCheck,
    stage: 'MVP',
    purpose: 'Run the review workflow with feedback.',
    features: ['Review queue', 'Grade submissions', 'Approve/request revision'],
    teachingValue: ['Workflow modeling', 'State-machine design'],
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: LuBookOpen,
    stage: 'MVP',
    purpose: 'Control curriculum structure and publication.',
    features: ['Create and publish courses', 'Organize modules', 'Lock/unlock lessons'],
    teachingValue: ['CRUD at scale', 'Nested content hierarchies'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: LuZap,
    stage: 'Intermediate',
    purpose: 'Use data to improve teaching outcomes.',
    features: ['Completion rates', 'Average scores', 'Drop-off detection'],
    teachingValue: ['Aggregations and time-series', 'Query optimization'],
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: LuMegaphone,
    stage: 'MVP',
    purpose: 'Communicate with students at hub level.',
    features: ['Post hub announcements', 'Message cohorts', 'Notification log'],
    teachingValue: ['Pub/sub patterns', 'Real-time communication'],
  },
  {
    id: 'hub',
    label: 'Hub',
    icon: LuBuilding2,
    stage: 'Intermediate',
    purpose: 'Manage cohort health and leaderboard.',
    features: ['Hub summary', 'Leaderboard', 'At-risk student list'],
    teachingValue: ['Cohort analytics', 'Ranking systems'],
  },
  {
    id: 'lessons',
    label: 'Lessons',
    icon: LuFolderKanban,
    stage: 'MVP',
    purpose: 'Author lesson content safely and quickly.',
    features: ['Markdown editing', 'Preview before publish', 'Embeds'],
    teachingValue: ['Content storage', 'XSS prevention'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: LuSettings,
    stage: 'MVP',
    purpose: 'Keep instructor workflow configurable.',
    features: ['Course-level policies', 'Notification preferences', 'Publishing safeguards'],
    teachingValue: ['Configuration schemas', 'Safe defaults'],
  },
] as const;


type SubmissionStatus = 'Pending' | 'Reviewed' | 'Approved';

interface HubSubmissionItem {
  id: string;
  studentId: string;
  student: string;
  assignment: string;
  status: SubmissionStatus;
  submitted: string;
}

interface HubAssignedItem {
  id: string;
  studentId: string;
  student: string;
  assignment: string;
  assignedAt: string;
}

const mapExerciseStatusToSubmissionStatus = (status: string): SubmissionStatus => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'reviewed') return 'Reviewed';
  if (normalized === 'approved') return 'Approved';
  return 'Pending';
};

const formatRelativeTime = (timestamp: string | null) => {
  if (!timestamp) return 'Not submitted';

  const submittedAt = new Date(timestamp);
  if (Number.isNaN(submittedAt.getTime())) return 'Not submitted';

  const diffMs = Date.now() - submittedAt.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return submittedAt.toLocaleDateString();
};
const stageBadgeVariant: Record<(typeof instructorSections)[number]['stage'] | 'Advanced', 'default' | 'secondary' | 'outline'> = {
  MVP: 'default',
  Intermediate: 'secondary',
  Advanced: 'outline',
};

const submissionBadgeVariant: Record<SubmissionStatus, 'default' | 'secondary' | 'outline'> = {
  Pending: 'secondary',
  Reviewed: 'outline',
  Approved: 'default',
};

type SectionId = (typeof instructorSections)[number]['id'];

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor';
  hub_location: string;
  streak?: number;
  xp?: number;
  last_activity_date?: string;
  lessons_completed?: number;
  achievements_count?: number;
  projects_completed?: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [hubSubmissionQueue, setHubSubmissionQueue] = useState<HubSubmissionItem[]>([]);
  const [hubAssignedExercises, setHubAssignedExercises] = useState<HubAssignedItem[]>([]);
  const [hubRecentActivity, setHubRecentActivity] = useState<string[]>([]);
  const [hubActiveStudentsCount, setHubActiveStudentsCount] = useState(0);
  const [hubActiveTodayCount, setHubActiveTodayCount] = useState(0);
  const [hubStuckStudentsCount, setHubStuckStudentsCount] = useState(0);
  const [exercisesCompletedToday, setExercisesCompletedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { section } = useParams();
  const activeSection = (section as SectionId) || 'dashboard';
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // Instructor Data States
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [activeModules, setActiveModules] = useState<any[]>([]);
  const [activeLessons, setActiveLessons] = useState<any[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);

  // Create Lesson Modal State
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonCourse, setNewLessonCourse] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');

  const handleCreateLesson = () => {
    if (newLessonTitle.trim()) {
      const newLesson = {
        id: Date.now().toString(),
        title: newLessonTitle,
        course_id: newLessonCourse || null,
        description: newLessonDescription,
        created_at: new Date().toISOString(),
      };
      setActiveLessons([newLesson, ...activeLessons]);
      setNewLessonTitle('');
      setNewLessonCourse('');
      setNewLessonDescription('');
      setShowCreateLessonModal(false);
    }
  };

  // Create Exercise Modal State
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [newExerciseTitle, setNewExerciseTitle] = useState('');
  const [newExerciseType, setNewExerciseType] = useState<'code' | 'document'>('code');
  const [newExerciseLanguage, setNewExerciseLanguage] = useState<'python' | 'javascript'>('python');
  const [newExerciseDifficulty, setNewExerciseDifficulty] = useState('beginner');
  const [newExerciseDueDate, setNewExerciseDueDate] = useState('');
  const [newExerciseXP, setNewExerciseXP] = useState(100);
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseFormattingRequirements, setNewExerciseFormattingRequirements] = useState('');

  const handleCreateExercise = async () => {
    if (!newExerciseTitle.trim() || !profile) return;

    if (students.length === 0) {
      alert('You have no students in your hub to assign this exercise to.');
      return;
    }

    try {
      const inserts = students.map((student) => ({
        instructor_id: profile.id,
        student_id: student.id,
        title: newExerciseTitle,
        instructions: newExerciseDescription,
        language: newExerciseType === 'document' ? 'document' : newExerciseLanguage,
        formatting_requirements: newExerciseType === 'document' ? newExerciseFormattingRequirements : null,
        due_date: newExerciseDueDate ? new Date(newExerciseDueDate).toISOString() : null,
        status: 'assigned',
      }));

      const { error } = await supabase.from('instructor_exercises').insert(inserts);

      if (error) {
        console.error('Failed to assign exercise:', error);
        alert('Failed to assign the exercise to your students.');
        return;
      }

      // Optimistically add to the assignment view (grouped or individual representation, keeping it simple as a group representation for now)
      const mockAssignedGroup = {
        id: Date.now().toString(),
        title: newExerciseTitle,
        type: newExerciseType === 'document' ? 'document' : newExerciseLanguage,
        difficulty_level: newExerciseDifficulty,
        xp_reward: newExerciseXP,
        description: newExerciseDescription,
        formatting_requirements: newExerciseFormattingRequirements,
        created_at: new Date().toISOString(),
      };

      setActiveAssignments([mockAssignedGroup, ...activeAssignments]);

      setNewExerciseTitle('');
      setNewExerciseType('code');
      setNewExerciseLanguage('python');
      setNewExerciseDifficulty('beginner');
      setNewExerciseDueDate('');
      setNewExerciseXP(100);
      setNewExerciseDescription('');
      setNewExerciseFormattingRequirements('');
      setShowCreateExerciseModal(false);

    } catch (err) {
      console.error('Error in handleCreateExercise', err);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate('/');
          return;
        }

        const profileRow = await fetchProfileForAuthUser(user as any);
        const metadata = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;
        const profileData = (profileRow ?? {
          id: user.id,
          email: user.email ?? '',
          role: String(metadata?.['role'] ?? metadata?.['user_role'] ?? 'student'),
          hub_location: String(metadata?.['hub_location'] ?? ''),
          full_name: String(metadata?.['full_name'] ?? user.email?.split('@')[0] ?? 'Instructor'),
          xp: Number(metadata?.['xp'] ?? 0),
          streak: Number(metadata?.['streak'] ?? 0),
          last_activity_date: String(metadata?.['last_activity_date'] ?? ''),
        }) as unknown as UserProfile;

        setProfile(profileData);

        const hasRoleColumn = profileRow ? Object.prototype.hasOwnProperty.call(profileRow, 'role') : false;

        if (profileData.role === 'instructor') {
          // If no hub location is set yet, we just show empty states instead of failing
          if (profileData.hub_location && hasRoleColumn) {
            const { data: studentData, error: studentError } = await supabase
              .from('profiles')
              .select('*')
              .eq('role', 'student')
              .eq('hub_location', profileData.hub_location);

            if (studentError) {
              console.error('Failed to load hub students', studentError);
            }

            let hubStudents = (!studentError && studentData ? studentData : []) as UserProfile[];

            // Fetch student metrics (XP, lessons, achievements) for each student
            if (hubStudents.length > 0) {
              const studentIds = hubStudents.map(s => s.id);
              
              // Fetch user_progress for lessons completed and XP
              const { data: progressData } = await supabase
                .from('user_progress')
                .select('user_id, item_type, status, progress_percentage')
                .in('user_id', studentIds);
              
              // Fetch user_achievements for achievements count
              const { data: achievementsData } = await supabase
                .from('user_achievements')
                .select('user_id')
                .in('user_id', studentIds);

              // Calculate metrics for each student
              const progressMap = new Map();
              const achievementsMap = new Map();

              // Count lessons completed per student
              progressData?.forEach((p: any) => {
                if (p.item_type === 'lesson' && p.status === 'completed') {
                  progressMap.set(p.user_id, (progressMap.get(p.user_id) || 0) + 1);
                }
              });

              // Count achievements per student
              achievementsData?.forEach((a: any) => {
                achievementsMap.set(a.user_id, (achievementsMap.get(a.user_id) || 0) + 1);
              });

              // Enrich student data with calculated metrics
              hubStudents = hubStudents.map(student => ({
                ...student,
                lessons_completed: progressMap.get(student.id) || 0,
                achievements_count: achievementsMap.get(student.id) || 0,
                projects_completed: 0 // Will be calculated separately if needed
              }));
            }

            setStudents(hubStudents);

            // Fetch Instructor Content
            const [
              { data: coursesData },
              { data: modulesData },
              { data: lessonsData },
              { data: exercisesData }
            ] = await Promise.all([
              supabase.from('courses').select('*'),
              supabase.from('course_modules').select('*'),
              supabase.from('lessons').select('*'),
              supabase.from('exercises').select('*')
            ]);

            setActiveCourses(coursesData || []);
            setActiveModules(modulesData || []);
            setActiveLessons(lessonsData || []);
            setActiveAssignments(exercisesData || []);

            const hubStudentIds = hubStudents.map((student) => String(student.id));
            const hubStudentIdSet = new Set(hubStudentIds);
            const studentNameMap = new Map(
              hubStudents.map((student) => [String(student.id), student.full_name || 'Student'])
            );

            if (hubStudentIds.length > 0) {
              const { data: exerciseData, error: exerciseError } = await supabase
                .from('instructor_exercises')
                .select(`
                  id, student_id, title, status, submitted_at, created_at,
                  student:profiles!inner(hub_location)
                `)
                .eq('instructor_id', user.id)
                .eq('student.hub_location', profileData.hub_location)
                .order('submitted_at', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false });

              if (!exerciseError && exerciseData) {
                // Separate: actual submissions (student submitted) vs assigned (not yet submitted)
                const submittedRows = exerciseData.filter((row: any) =>
                  hubStudentIdSet.has(String(row.student_id)) &&
                  String(row.status || '').toLowerCase() !== 'assigned'
                );
                const assignedRows = exerciseData.filter((row: any) =>
                  hubStudentIdSet.has(String(row.student_id)) &&
                  String(row.status || '').toLowerCase() === 'assigned'
                );

                // Student submissions
                const hubItems: HubSubmissionItem[] = submittedRows
                  .map((row: any) => {
                    const studentId = String(row.student_id || '');
                    return {
                      id: String(row.id || ''),
                      studentId,
                      student: studentNameMap.get(studentId) || 'Student',
                      assignment: String(row.title || 'Untitled Assignment'),
                      status: mapExerciseStatusToSubmissionStatus(String(row.status || '')),
                      submitted: formatRelativeTime(row.submitted_at ? String(row.submitted_at) : null),
                    };
                  })
                  .slice(0, 12);

                setHubSubmissionQueue(hubItems);

                // Assigned exercises (not yet submitted by students)
                const assignedItems: HubAssignedItem[] = assignedRows
                  .map((row: any) => {
                    const studentId = String(row.student_id || '');
                    return {
                      id: String(row.id || ''),
                      studentId,
                      student: studentNameMap.get(studentId) || 'Student',
                      assignment: String(row.title || 'Untitled Assignment'),
                      assignedAt: formatRelativeTime(row.created_at ? String(row.created_at) : null),
                    };
                  })
                  .slice(0, 12);

                setHubAssignedExercises(assignedItems);

                const fallbackActivity = hubItems
                  .map((item) => `${item.student} ${item.status === 'Pending' ? 'submitted' : 'updated'} ${item.assignment}`)
                  .slice(0, 8);

                setHubRecentActivity(fallbackActivity);
                setHubActiveStudentsCount(new Set(hubItems.map((item) => item.studentId)).size);
              } else {
                setHubSubmissionQueue([]);
                setHubAssignedExercises([]);
                setHubRecentActivity([]);
                setHubActiveStudentsCount(0);

                if (exerciseError?.code !== '42P01') {
                  console.error('Failed to load hub submissions', exerciseError);
                }
              }

              const { data: activityData, error: activityError } = await supabase
                .from('user_activity_logs')
                .select('user_id, active_date')
                .in('user_id', hubStudentIds)
                .order('active_date', { ascending: false });

              if (!activityError && activityData && activityData.length > 0) {
                // limit feed to 8
                const recentLogs = activityData.slice(0, 8);
                const activityFeed = recentLogs.map((row: any) => {
                  const studentName = studentNameMap.get(String(row.user_id || '')) || 'Student';
                  const activeDate = row.active_date ? new Date(String(row.active_date)).toLocaleDateString() : 'recently';
                  return `${studentName} was active on ${activeDate}`;
                });

                setHubRecentActivity(activityFeed);

                // Calculate "Active Students" (all distinct active students in the hub)
                setHubActiveStudentsCount(new Set(activityData.map((row: any) => String(row.user_id || ''))).size);

                // Calculate "Active Today"
                const todayStr = new Date().toLocaleDateString();
                const activeToday = new Set(activityData.filter(row =>
                  row.active_date && new Date(String(row.active_date)).toLocaleDateString() === todayStr
                ).map(row => String(row.user_id))).size;

                setHubActiveTodayCount(activeToday);
              } else if (activityError?.code !== '42P01') {
                console.error('Failed to load hub activity', activityError);
              }

              // Load Progress Data for accurate metrics
              const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select('user_id, item_type, status, updated_at')
                .in('user_id', hubStudentIds);

              if (!progressError && progressData) {
                // Exercises completed today
                const todayStr2 = new Date().toLocaleDateString();
                const completedTodayCount = new Set(progressData.filter(row =>
                  row.status === 'completed' &&
                  row.updated_at &&
                  new Date(String(row.updated_at)).toLocaleDateString() === todayStr2
                ).map(row => String(row.user_id))).size;

                setExercisesCompletedToday(completedTodayCount);

                // Stuck Students is not reliably available without failed_attempts
                // Provide a placeholder or fallback. For now, 0.
                setHubStuckStudentsCount(0);
              } else if (progressError?.code !== '42P01') {
                console.error('Failed to load user progress', progressError);
              }
            } else {
              setHubSubmissionQueue([]);
              setHubRecentActivity([]);
              setHubActiveStudentsCount(0);
              setHubActiveTodayCount(0);
              setHubStuckStudentsCount(0);
              setExercisesCompletedToday(0);
            }
          }
        } else {
          // Admin UI is not for students
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [navigate, profile?.hub_location]);


  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading instructor workspace...</div>;
  if (!profile) return null;

  const selectedSection = instructorSections.find((s) => s.id === activeSection) ?? instructorSections[0];
  const totalStudents = students.length;
  const assignmentsPendingReview = hubSubmissionQueue.filter((item) => item.status === 'Pending').length;
  const recentActivityCount = hubRecentActivity.length;
  const reviewedSubmissions = hubSubmissionQueue.filter(
    (item) => item.status === 'Reviewed' || item.status === 'Approved',
  ).length;

  const analyticsSnapshot = {
    avgCompletion:
      hubSubmissionQueue.length > 0
        ? Math.round((reviewedSubmissions / hubSubmissionQueue.length) * 100)
        : 0,
    reviewedSubmissions,
    inactiveStudents: Math.max(totalStudents - hubActiveStudentsCount, 0),
    dropOffPoint:
      hubSubmissionQueue.length > 0 ? 'Track in submissions table' : 'No hub submission data yet',
  };

  const nickname = profile.full_name;
  const xp = profile.xp || 0;
  const level = calculateUserLevel(xp);

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sidebar p-3">
              <div className="order-1 relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  defaultValue=""
                  placeholder="Search students, courses..."
                  className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none"
                />
              </div>
              <div className="order-2 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground" onClick={() => navigate('/settings')}>
                  <LuBell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground" onClick={() => navigate('/achievements')}>
                  <LuSparkles className="h-4 w-4" />
                </Button>
              </div>
              <div className="order-3 ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={dashboardAvatar} alt={nickname} />
                  <AvatarFallback>{nickname ? nickname[0] : 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden pr-2 text-sm text-foreground sm:block">{nickname}</span>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                  }}
                  className="rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 h-8 ml-2"
                >
                  Log out
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border-border bg-primary">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-2 inline-block">
                  <Select
                      value={profile.hub_location || ''}
                      onValueChange={async (val) => {
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) throw new Error('Not authenticated');
                          
                          setProfile(prev => prev ? { ...prev, hub_location: val } : prev);
                          await updateProfileForAuthUser(user as any, { hub_location: val });
                          
                          const metadata = (user.user_metadata as Record<string, unknown> | undefined) ?? {};
                          await supabase.auth.updateUser({
                            data: { ...metadata, hub_location: val },
                          });
                          
                          toast.success(`Hub changed to ${val}. Refreshing data...`);
                          setTimeout(() => window.location.reload(), 1000); 
                        } catch (err) {
                           console.error('Failed to change hub', err);
                           toast.error('Failed to change hub');
                        }
                      }}
                    >
                      <SelectTrigger className="w-auto h-7 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border-white/20 focus:ring-0 gap-2">
                        <SelectValue placeholder="Select Hub" />
                      </SelectTrigger>
                      <SelectContent>
                        {HUB_LOCATIONS.map((hub) => (
                          <SelectItem key={hub} value={hub}>{hub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <h2 className="heading-font lowercase mt-1 max-w-md text-2xl leading-tight text-white sm:text-3xl">
                  Instructor Dashboard
                </h2>
                <p className="mt-2 text-sm text-white/80">Optimize teaching efficiency, student visibility, and content control.</p>
                <Button className="mt-5 rounded-full bg-white text-foreground hover:bg-white/90">
                  <LuBell className="mr-2 h-4 w-4" />
                  Send Announcement
                </Button>
              </CardContent>
            </Card>

            {/* Main content area based on section */}
            {activeSection === 'students' && (
              <div className={`grid grid-cols-1 ${selectedStudent ? 'lg:grid-cols-2' : ''} gap-4 items-start`}>
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="heading-font lowercase text-xl text-foreground">
                        Student Directory ({profile.hub_location || 'All'})
                      </CardTitle>
                      <CardDescription>
                        All students currently registered at your hub.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-y border-border text-xs text-muted-foreground bg-sidebar/50">
                            <th className="px-4 py-3 font-medium">Student</th>
                            <th className="px-4 py-3 font-medium text-center">Lessons</th>
                            <th className="px-4 py-3 font-medium text-center">XP</th>
                            <th className="px-4 py-3 font-medium text-center">Achievements</th>
                            <th className="px-4 py-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.length > 0 ? (
                            students.map((student) => (
                              <tr key={student.id} className={`border-b border-border text-sm text-foreground last:border-b-0 hover:bg-sidebar/30 transition-colors ${selectedStudent?.id === student.id ? 'bg-secondary/30' : ''}`}>
                                <td className="whitespace-nowrap px-4 py-3">
                                  <p className="font-medium">{student.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                    {student.lessons_completed || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-emerald-600 font-medium">{student.xp || 0}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                    {student.achievements_count || 0}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="rounded-full text-xs h-8"
                                    onClick={() => navigate(`/instructor/students/${student.id}`)}
                                  >
                                    View Profile
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center py-8 text-muted-foreground bg-sidebar/30">
                                {profile.hub_location ? `No students have registered for ${profile.hub_location} yet.` : 'You are not assigned to a hub yet.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {selectedStudent && (
                  <Card className="rounded-2xl border-border bg-card animate-in fade-in slide-in-from-right-4">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle className="heading-font lowercase text-xl text-foreground">
                          {selectedStudent.full_name}
                        </CardTitle>
                        <CardDescription>{selectedStudent.email}</CardDescription>
                      </div>
                      <Button size="sm" variant="ghost" className="rounded-full h-8 px-3 text-muted-foreground hover:text-foreground" onClick={() => setSelectedStudent(null)}>
                        Hide
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="rounded-xl border border-border p-4 bg-sidebar">
                        <h3 className="font-medium text-foreground mb-4">Account Snapshot</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge className="bg-success/20 text-success hover:bg-success/30 rounded-full">Active</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hub</span>
                            <span className="text-foreground capitalize">{selectedStudent.hub_location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Role</span>
                            <span className="text-foreground capitalize">{selectedStudent.role}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border p-4 bg-sidebar">
                        <h3 className="font-medium text-foreground mb-4">Submission History</h3>
                        <div className="space-y-3">
                          {hubSubmissionQueue.filter(sub => sub.studentId === selectedStudent.id).length > 0 ? (
                            hubSubmissionQueue.filter(sub => sub.studentId === selectedStudent.id).map(sub => (
                              <div key={sub.id} className="flex justify-between items-center bg-secondary/50 p-2 rounded-lg text-sm border border-border">
                                <div>
                                  <p className="font-medium text-foreground truncate max-w-[150px]" title={sub.assignment}>{sub.assignment}</p>
                                  <p className="text-xs text-muted-foreground">{sub.submitted}</p>
                                </div>
                                <Badge variant={submissionBadgeVariant[sub.status]} className="text-[10px] uppercase">{sub.status}</Badge>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              No submissions found for this learner yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeSection === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <Card className="rounded-2xl border-border bg-sidebar">
                    <CardContent className="p-3 !pb-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Students</p>
                      <p className="mt-1 text-2xl text-foreground font-bold">{students.length}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Registered in hub</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border bg-sidebar">
                    <CardContent className="p-3 !pb-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Active Today</p>
                      <p className="mt-1 text-2xl text-foreground font-bold">{hubActiveTodayCount}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <LuZap className="h-3 w-3" /> Engaging now
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border bg-sidebar">
                    <CardContent className="p-3 !pb-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Completed Today</p>
                      <p className="mt-1 text-2xl text-foreground font-bold">{exercisesCompletedToday}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Exercises reviewed</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border bg-sidebar">
                    <CardContent className="p-3 !pb-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Stuck Students</p>
                      <p className="mt-1 text-2xl text-foreground font-bold">{hubStuckStudentsCount}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Requires intervention</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-border bg-sidebar">
                    <CardContent className="p-3 !pb-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Pending Review</p>
                      <p className="mt-1 text-2xl text-foreground font-bold">{assignmentsPendingReview}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting feedback</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="heading-font lowercase text-lg text-foreground">Student Submissions</CardTitle>
                    <CardDescription>Submissions received from learners at {profile.hub_location}.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left">
                        <thead>
                          <tr className="border-y border-border text-xs text-muted-foreground">
                            <th className="px-4 py-3 font-medium">Student</th>
                            <th className="px-4 py-3 font-medium">Assignment</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Submitted</th>
                            <th className="px-4 py-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hubSubmissionQueue.length > 0 ? (
                            hubSubmissionQueue.slice(0, 5).map((item) => (
                              <tr key={item.id} className="border-b border-border text-sm text-foreground last:border-b-0">
                                <td className="whitespace-nowrap px-4 py-3 font-medium">{item.student}</td>
                                <td className="px-4 py-3">{item.assignment}</td>
                                <td className="px-4 py-3">
                                  <Badge variant={submissionBadgeVariant[item.status]}>{item.status}</Badge>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{item.submitted}</td>
                                <td className="px-4 py-3">
                                  <Button size="sm" variant="ghost" className="rounded-full border border-border text-xs" onClick={() => navigate('/instructor/submissions')}>
                                    Review
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                No submissions from students yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="heading-font lowercase text-lg text-foreground">Assigned Exercises</CardTitle>
                    <CardDescription>Exercises sent to learners at {profile.hub_location} — awaiting their submission.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left">
                        <thead>
                          <tr className="border-y border-border text-xs text-muted-foreground">
                            <th className="px-4 py-3 font-medium">Student</th>
                            <th className="px-4 py-3 font-medium">Exercise</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Assigned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hubAssignedExercises.length > 0 ? (
                            hubAssignedExercises.slice(0, 5).map((item) => (
                              <tr key={item.id} className="border-b border-border text-sm text-foreground last:border-b-0">
                                <td className="whitespace-nowrap px-4 py-3 font-medium">{item.student}</td>
                                <td className="px-4 py-3">{item.assignment}</td>
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Awaiting</Badge>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{item.assignedAt}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                No pending assignments.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 'courses' && (
              <Card className="rounded-2xl border-border bg-card relative overflow-hidden">
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <Badge className="px-5 py-2 text-sm font-semibold tracking-widest uppercase bg-primary text-primary-foreground shadow-lg">
                    Coming Soon
                  </Badge>
                </div>
                <div className="pointer-events-none select-none opacity-60 blur-[1px]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="heading-font lowercase text-xl text-foreground">Course Catalog</CardTitle>
                      <CardDescription>Manage curriculum structure and module organization.</CardDescription>
                    </div>
                    <Button size="sm" className="rounded-full" disabled>
                      <LuBookOpen className="mr-2 h-4 w-4" /> Create Course
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCourses.map(course => (
                          <Card key={course.id} className="rounded-xl border border-border bg-sidebar hover:border-primary/50 transition">
                            <CardContent className="p-4 flex gap-4">
                              <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-3xl shrink-0">
                                {course.icon || '📚'}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="font-semibold text-foreground line-clamp-1">{course.title}</h3>
                                  <Badge variant="outline" className="text-[10px] rounded-full px-2 uppercase">{course.difficulty_level || 'Beginner'}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description || 'No description provided.'}</p>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="secondary" className="h-7 text-xs rounded-lg flex-1">Modules ({activeModules.filter(m => m.course_id === course.id).length})</Button>
                                  <Button size="sm" variant="default" className="h-7 text-xs rounded-lg flex-1">Edit Course</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                        No courses available. Start by creating your first course.
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )}

            {activeSection === 'lessons' && (
              <>
                <Card className="rounded-2xl border-border bg-card relative overflow-hidden">
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <Badge className="px-5 py-2 text-sm font-semibold tracking-widest uppercase bg-primary text-primary-foreground shadow-lg">
                      Coming Soon
                    </Badge>
                  </div>
                  <div className="pointer-events-none select-none opacity-60 blur-[1px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="heading-font lowercase text-xl text-foreground">Lesson Content Editor</CardTitle>
                        <CardDescription>Author and organize individual lesson structures.</CardDescription>
                      </div>
                      <Button size="sm" className="rounded-full" disabled>
                        <LuFolderKanban className="mr-2 h-4 w-4" /> New Lesson
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {activeLessons.length > 0 ? (
                        <div className="space-y-2">
                          {activeLessons.slice(0, 2).map(lesson => {
                            const course = activeCourses.find(c => c.id === lesson.course_id);
                            return (
                              <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-sidebar hover:bg-secondary/50 transition">
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/10 text-primary p-2 rounded-lg"><LuFolderKanban className="h-4 w-4" /></div>
                                  <div>
                                    <p className="font-medium text-sm text-foreground">{lesson.title}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      {course?.title || 'Unassigned'}
                                    </p>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs">Edit Content</Button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                          No lessons have been created yet.
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>

                {/* Create Lesson Modal */}
                {showCreateLessonModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="rounded-2xl border-border bg-card w-full max-w-lg">
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                          <CardTitle className="heading-font lowercase text-xl text-foreground">Create New Lesson</CardTitle>
                          <CardDescription>Add a new lesson to your curriculum</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setShowCreateLessonModal(false)}
                        >
                          <LuX className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Lesson Title *</label>
                          <input
                            type="text"
                            placeholder="e.g., Introduction to React Hooks"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Course</label>
                          <select
                            value={newLessonCourse}
                            onChange={(e) => setNewLessonCourse(e.target.value)}
                            className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select a course...</option>
                            {activeCourses.map(course => (
                              <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                          <textarea
                            placeholder="Brief description of the lesson content..."
                            value={newLessonDescription}
                            onChange={(e) => setNewLessonDescription(e.target.value)}
                            className="min-h-[100px] w-full rounded-xl border border-border bg-sidebar px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-border">
                          <Button
                            className="flex-1 rounded-full"
                            onClick={handleCreateLesson}
                            disabled={!newLessonTitle.trim()}
                          >
                            <LuFolderKanban className="mr-2 h-4 w-4" />
                            Create Lesson
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setShowCreateLessonModal(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}

            {activeSection === 'assignments' && (
              <>
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="heading-font lowercase text-xl text-foreground">Exercises & Projects</CardTitle>
                      <CardDescription>Build interactive validation and practical tasks.</CardDescription>
                    </div>
                    <Button size="sm" className="rounded-full" onClick={() => setShowCreateExerciseModal(true)}>
                      <LuTarget className="mr-2 h-4 w-4" /> Add Exercise
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeAssignments.length > 0 ? (
                      <div className="space-y-2">
                        {activeAssignments.map(exercise => (
                          <div key={exercise.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-sidebar hover:bg-secondary/50 transition">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent/10 text-accent p-2 rounded-lg">
                                <LuKey className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{exercise.title}</p>
                                <p className="text-xs text-muted-foreground">Type: <span className="uppercase text-foreground">{exercise.type || 'Standard'}</span> • Points: {exercise.xp_reward || 0}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] rounded-full">Configured</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                        No exercises found.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Create Exercise Modal */}
                {showCreateExerciseModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-16">
                    <Card className="rounded-2xl border-border bg-card w-full max-w-lg flex flex-col" style={{ maxHeight: '70vh' }}>
                      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
                        <div>
                          <CardTitle className="heading-font lowercase text-xl text-foreground">Create New Exercise</CardTitle>
                          <CardDescription>Add a new exercise or project assignment</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setShowCreateExerciseModal(false)}
                        >
                          <LuX className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Exercise Title *</label>
                          <input
                            type="text"
                            placeholder="e.g., Build a To-Do App"
                            value={newExerciseTitle}
                            onChange={(e) => setNewExerciseTitle(e.target.value)}
                            className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Assignment Type</label>
                            <select
                              value={newExerciseType}
                              onChange={(e) => setNewExerciseType(e.target.value as 'code' | 'document')}
                              className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="code">Code Exercise</option>
                              <option value="document">Document Upload</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Due Date</label>
                            <input
                              type="date"
                              value={newExerciseDueDate}
                              onChange={(e) => setNewExerciseDueDate(e.target.value)}
                              className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              {newExerciseType === 'document' ? 'Submission Format' : 'Language'}
                            </label>
                            {newExerciseType === 'document' ? (
                              <div className="rounded-xl border border-border bg-sidebar px-3 py-2 text-sm text-muted-foreground">
                                Word or PDF upload (`.doc`, `.docx`, `.pdf`)
                              </div>
                            ) : (
                              <select
                                value={newExerciseLanguage}
                                onChange={(e) => setNewExerciseLanguage(e.target.value as 'python' | 'javascript')}
                                className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                              </select>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Difficulty</label>
                            <select
                              value={newExerciseDifficulty}
                              onChange={(e) => setNewExerciseDifficulty(e.target.value)}
                              className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">XP Reward</label>
                          <input
                            type="number"
                            min="10"
                            max="1000"
                            value={newExerciseXP}
                            onChange={(e) => setNewExerciseXP(Number(e.target.value))}
                            className="h-10 w-full rounded-xl border border-border bg-sidebar px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
                          <textarea
                            placeholder="Exercise instructions and requirements..."
                            value={newExerciseDescription}
                            onChange={(e) => setNewExerciseDescription(e.target.value)}
                            className="min-h-[100px] w-full rounded-xl border border-border bg-sidebar px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </div>
                        {newExerciseType === 'document' && (
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Formatting Requirements</label>
                            <textarea
                              placeholder="Example: 3-5 pages, Times New Roman 12pt, 1.5 spacing, APA references, include a title page."
                              value={newExerciseFormattingRequirements}
                              onChange={(e) => setNewExerciseFormattingRequirements(e.target.value)}
                              className="min-h-[100px] w-full rounded-xl border border-border bg-sidebar px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                          </div>
                        )}
                      </CardContent>
                      {/* Sticky footer — always visible */}
                      <div className="flex gap-2 px-6 py-4 border-t border-border flex-shrink-0">
                        <Button
                          className="flex-1 rounded-full"
                          onClick={handleCreateExercise}
                          disabled={!newExerciseTitle.trim()}
                        >
                          <LuTarget className="mr-2 h-4 w-4" />
                          Create Exercise
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setShowCreateExerciseModal(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}

            {activeSection === 'submissions' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SubmissionsPage />
              </div>
            )}

            {activeSection === 'analytics' && (
              <Card className="rounded-2xl border-border bg-card">
                <CardHeader>
                  <CardTitle className="heading-font lowercase text-xl text-foreground">Teaching Analytics</CardTitle>
                  <CardDescription>Metrics based on user events and submission velocity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                    <LuZap className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>Detailed visualization charts will appear here.</p>
                    <p className="text-xs mt-1">Currently aggregating interaction records for {students.length} students.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'settings' && (
              <Card className="rounded-2xl border-border bg-card">
                <CardHeader>
                  <CardTitle className="heading-font lowercase text-xl text-foreground">Instructor Preferences</CardTitle>
                  <CardDescription>Configure notifications and assignment validation rules.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-foreground">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive daily digest of new submissions</p>
                      </div>
                      <Badge variant="default" className="rounded-full cursor-not-allowed">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-foreground">Auto-Review Trivial Exercises</p>
                        <p className="text-xs text-muted-foreground">Automatically pass coding questions that pass unit tests</p>
                      </div>
                      <Badge variant="outline" className="rounded-full text-muted-foreground hover:bg-secondary cursor-pointer">Off</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Right Column (Sidebar) */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base text-foreground heading-font lowercase">Instructor Profile</h3>
                  <LuEllipsis className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 border border-border">
                    <AvatarImage src={dashboardAvatar} alt={nickname} />
                    <AvatarFallback>{nickname ? nickname[0] : 'U'}</AvatarFallback>
                  </Avatar>
                  <p className="mt-3 text-base text-foreground">{getGreeting()} {nickname}</p>
                  <p className="text-xs text-muted-foreground">Hub: {profile.hub_location}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground flex flex-col items-center">
                    <span className="text-[10px] opacity-70">Students</span>
                    <span className="mt-1 text-base text-foreground font-semibold">{totalStudents}</span>
                  </div>
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground flex flex-col items-center">
                    <span className="text-[10px] opacity-70">Courses</span>
                    <span className="mt-1 text-base text-foreground font-semibold">{activeCourses.length}</span>
                  </div>
                  <div className="col-span-2 rounded-xl bg-sidebar p-2 text-muted-foreground flex flex-col items-center">
                    <span className="text-[10px] opacity-70">Hub Presence</span>
                    <span className="mt-1 text-foreground font-medium">{profile.hub_location || 'Remote'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font lowercase text-base text-foreground">Review Velocity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-xl bg-sidebar p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                    <p className="mt-0.5 text-lg text-foreground font-semibold">{assignmentsPendingReview}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <LuClock3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="rounded-xl bg-sidebar p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Successful Reviews</p>
                    <p className="mt-0.5 text-lg text-foreground font-semibold">{reviewedSubmissions}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <LuCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="rounded-xl bg-sidebar p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-muted-foreground">Hub Completion Rate</p>
                    <p className="text-xs text-foreground font-medium">{analyticsSnapshot.avgCompletion}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${analyticsSnapshot.avgCompletion}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font lowercase text-base text-foreground">Recent Student Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hubRecentActivity.length > 0 ? (
                  hubRecentActivity.map((item) => (
                    <div key={item} className="rounded-xl bg-sidebar p-3 text-sm text-foreground">
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-sidebar p-3 text-sm text-muted-foreground">
                    No recent activity recorded for your hub yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
