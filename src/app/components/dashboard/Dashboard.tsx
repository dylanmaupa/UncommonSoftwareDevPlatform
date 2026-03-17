import { Link, useNavigate } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import StreakWidget from './StreakWidget';
// @ts-ignore
import dashboardAvatar from '../../../assets/avatar2.png';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  LuArrowRight,
  LuBell,
  LuBookOpen,
  LuChevronRight,
  LuEllipsis,
  LuFlame,
  LuSearch,
  LuSparkles,
  LuTarget,
  LuUsers,
} from 'react-icons/lu';
import { useEffect, useState, useMemo } from 'react';
import { calculateUserLevel } from '../../../lib/gamificationUtils';
import { supabase } from '../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../lib/profileAccess';
import { getGreeting } from '../../lib/timeUtils';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor';
  hub_location: string;
  specialization?: string | null;
  streak?: number;
  xp?: number;
  last_activity_date?: string;
  avatar_url?: string;
}

interface InstructorExercise {
  id: string;
  instructor_id: string;
  student_id: string;
  title: string;
  instructions: string;
  language: 'python' | 'javascript';
  status: 'assigned' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  due_date: string | null;
  created_at: string;
  submitted_at: string | null;
  instructor_name: string;
}

interface DashboardMainProps {
  profile: UserProfile;
  students: UserProfile[];
  instructors: UserProfile[];
  courses: any[];
  xp: number;
  level: number;
  streak: number;
  completedLessons: number;
  nextCourse: any;
  inProgressCourses: any[];
  assignedExercises: InstructorExercise[];
  userProgress: any[];
}

function DashboardMain({
  profile,
  students,
  instructors,
  courses,
  xp,
  level,
  streak,
  completedLessons,
  nextCourse,
  inProgressCourses,
  assignedExercises,
  userProgress,
}: DashboardMainProps) {
  const navigate = useNavigate();
  const getCourseImage = (title: string) => {
    const normalized = title?.toLowerCase() || '';

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

  const featuredCourses = courses.slice(0, 3);
  const nickname = profile.full_name;

  const activityData = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    const labels = ['', '', '']; 
    
    // Split last 30 days into 5 chunks of 6 days each.
    // Bucket 0: oldest (Day -30 to -24), ..., Bucket 4: newest (Day -6 to Now)
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;

    // Filter progress that is completed
    const completedProgress = userProgress?.filter(p => p.status === 'completed' && p.updated_at) || [];

    completedProgress.forEach(p => {
      const updatedDate = new Date(p.updated_at);
      const diffDays = Math.floor((now.getTime() - updatedDate.getTime()) / msPerDay);
      
      if (diffDays >= 0 && diffDays < 30) {
        // Map 0-5 to bucket 4, 6-11 to bucket 3... 24-29 to bucket 0
        const bucketIndex = 4 - Math.floor(diffDays / 6);
        if (bucketIndex >= 0 && bucketIndex < 5) {
          buckets[bucketIndex]++;
        }
      }
    });

    // Formatting labels corresponding roughly to Bucket 0, Bucket 2, Bucket 4
    const formatDateObj = (dateObj: Date) => {
      return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    const d30 = new Date(now.getTime() - 30 * msPerDay);
    const d24 = new Date(now.getTime() - 24 * msPerDay);
    
    const d18 = new Date(now.getTime() - 18 * msPerDay);
    const d12 = new Date(now.getTime() - 12 * msPerDay);
    
    const d6 = new Date(now.getTime() - 6 * msPerDay);

    labels[0] = `${formatDateObj(d30)} - ${formatDateObj(d24)}`;
    labels[1] = `${formatDateObj(d18)} - ${formatDateObj(d12)}`;
    labels[2] = `${formatDateObj(d6)} - ${formatDateObj(now)}`;

    const maxCount = Math.max(...buckets, 1); // Avoid div by 0
    // Possible heights from small ticks to full size based on granular completion milestones
    const heightClasses = ['h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8', 'h-10', 'h-12', 'h-14'];
    
    const mappedBuckets = buckets.map(count => {
      if (count === 0) return { height: 'h-0', opacity: 'bg-transparent' };
      const ratio = count / maxCount;
      const classIndex = Math.min(Math.floor(ratio * heightClasses.length), heightClasses.length - 1);
      
      let opacity = 'bg-primary/50';
      if (ratio > 0.8) opacity = 'bg-primary';
      else if (ratio > 0.5) opacity = 'bg-primary/70';
      else if (ratio > 0.2) opacity = 'bg-primary/40';

      return { height: heightClasses[classIndex], opacity };
    });

    return { bars: mappedBuckets, labels };
  }, [userProgress]);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sidebar p-3">
            <div className="order-1 relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                defaultValue=""
                placeholder="Search your course..."
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
                <AvatarImage src={profile.avatar_url || dashboardAvatar} alt={nickname} />
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
              <p className="text-xs uppercase tracking-wider text-white/80">Online Course</p>
              <h2 className="heading-font lowercase mt-2 max-w-md text-2xl leading-tight text-white sm:text-3xl">
                Sharpen Your Skills with Professional Online Courses
              </h2>
              <p className="mt-2 text-sm text-white/80">Continue with: {nextCourse.title}</p>
              <Button className="mt-5 rounded-full bg-white text-foreground hover:bg-white/90" onClick={() => navigate('/courses')}>
                Join Now
                <LuArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>



          {inProgressCourses.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg text-foreground heading-font lowercase">Timeline</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={() => navigate('/courses')}>
                  <LuChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {inProgressCourses.slice(0, 3).map((course) => (
                  <Link to={`/courses/${course.id}`} key={course.id} className="block group">
                    <Card className="rounded-2xl border-border group-hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="space-y-3 p-3">
                        <img
                          src={getCourseImage(course.title)}
                          alt={course.title}
                          className="h-24 w-full rounded-xl object-cover"
                          loading="lazy"
                        />
                        <div>
                          <p className="line-clamp-2 text-sm text-foreground">{course.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{course.difficulty}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{course.progress}% complete</p>
                          <span className="text-sm">{course.icon}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {profile.role === 'student' && (
            <Card className="rounded-2xl border-border">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-lg text-foreground heading-font lowercase">Instructor Exercises</h3>
                  <Link to="/sandbox" className="text-xs text-muted-foreground hover:text-foreground">Open sandbox</Link>
                </div>

                <div className="space-y-2 p-3">
                  {assignedExercises.length > 0 ? assignedExercises.map((exercise) => {
                    const statusTone =
                      exercise.status === 'submitted'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : (exercise.status === 'reviewed' || exercise.status === 'approved')
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : exercise.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200';

                    const isLate = exercise.due_date && (
                      exercise.status === 'assigned'
                        ? new Date() > new Date(exercise.due_date)
                        : (exercise.submitted_at && new Date(exercise.submitted_at) > new Date(exercise.due_date))
                    );

                    return (
                      <div key={exercise.id} className={`relative rounded-xl border ${isLate ? 'border-red-500/50 bg-red-500/5' : 'border-border bg-sidebar'} p-3`}>
                        <div className={exercise.language === 'javascript' ? 'blur-[2px] pointer-events-none select-none' : ''}>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm text-foreground">{exercise.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">From {exercise.instructor_name} • Uploaded {new Date(exercise.created_at).toLocaleDateString()}</p>
                              <p className={`text-xs ${isLate ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                {exercise.due_date ? `Due ${new Date(exercise.due_date).toLocaleDateString()}` : 'No due date'}
                                {isLate && ' (Late)'}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              <Badge className={`border ${statusTone}`}>
                                {exercise.status === 'rejected' ? 'needs revision' : exercise.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <p className="line-clamp-2 text-xs text-muted-foreground">{exercise.instructions || 'Open the sandbox to view full instructions.'}</p>
                            <Button
                              size="sm"
                              disabled={exercise.language === 'javascript'}
                              className="h-8 rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                              onClick={() => navigate(`/sandbox?exerciseId=${exercise.id}`)}
                            >
                              {exercise.language === 'javascript' ? 'Coming soon' : exercise.status === 'assigned' ? 'Start' : 'Open'}
                            </Button>
                          </div>
                        </div>

                        {exercise.language === 'javascript' && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/15 bg-black/35 backdrop-blur-sm shadow-[inset_0_0_30px_rgba(255,255,255,0.12)]">
                            <span className="rounded-full border border-white/30 bg-black/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                              JavaScript Coming Soon
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="rounded-xl border border-dashed border-border bg-sidebar p-4 text-sm text-muted-foreground">
                      No assigned exercises yet. Your instructor will send one soon.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-lg text-foreground heading-font lowercase">
                  {profile.role === 'instructor' ? 'Student Directory' : 'Your Lesson'}
                </h3>
                <Link to="/courses" className="text-xs text-muted-foreground hover:text-foreground">See all</Link>
              </div>
              <div className="overflow-x-auto">
                {profile.role === 'instructor' ? (
                  <table className="w-full min-w-[480px] text-left">
                    <thead>
                      <tr className="text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Hub</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length > 0 ? (
                        students.map((student) => (
                          <tr key={student.id} className="border-t border-border text-sm text-foreground">
                            <td className="whitespace-nowrap px-4 py-3">{student.full_name}</td>
                            <td className="whitespace-nowrap px-4 py-3">{student.email}</td>
                            <td className="px-4 py-3">{student.hub_location}</td>
                            <td className="px-4 py-3">
                              <Button size="sm" className="h-8 rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted-foreground">No students found for this hub location.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full min-w-[480px] text-left">
                    <thead>
                      <tr className="text-xs text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Instructor</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Desc</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructors.length > 0 ? (
                        instructors.slice(0, 1).map((instructor) => (
                          <tr key={instructor.id} className="border-t border-border text-sm text-foreground">
                            <td className="whitespace-nowrap px-4 py-3">{instructor.full_name}</td>
                            <td className="whitespace-nowrap px-4 py-3">{instructor.specialization || 'Software Engineering'}</td>
                            <td className="px-4 py-3">Learn {instructor.specialization || 'Software Engineering'} today</td>
                            <td className="px-4 py-3">
                              <Button size="sm" className="h-8 rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90" onClick={() => navigate('/courses')}>Start
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-border text-sm text-foreground">
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground" colSpan={4}>Waiting for an instructor to join your Hub.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font lowercase">Profile Overview</h3>
                <LuEllipsis className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border border-border">
                  <AvatarImage src={profile.avatar_url || dashboardAvatar} alt={nickname} />
                  <AvatarFallback>{nickname ? nickname[0] : 'U'}</AvatarFallback>
                </Avatar>
                <p className="mt-3 text-base text-foreground">{getGreeting()} {nickname}</p>
                <p className="text-xs text-muted-foreground">{profile.role === 'instructor' ? `Hub: ${profile.hub_location}` : 'Continue your journey to your target'}</p>
              </div>
              <div className="rounded-2xl bg-secondary p-3">
                <div className="mb-2 flex items-end justify-between gap-2 h-14">
                  {activityData.bars.map((bar: { height: string, opacity: string }, i: number) => (
                    <div key={i} className={`w-8 rounded-md ${bar.height} ${bar.opacity} transition-all duration-300`} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground whitespace-nowrap">
                  <span>{activityData.labels[0]}</span>
                  <span>{activityData.labels[1]}</span>
                  <span>{activityData.labels[2]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">XP: {xp}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Level: {level}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Lessons: {completedLessons}</div>
              </div>
              <div className="mt-4">
                <StreakWidget
                  streak={profile.streak || 0}
                  userId={profile.id}
                  lastActivityDate={profile.last_activity_date}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font lowercase">
                  {profile.role === 'instructor' ? 'Other Instructors' : 'Your Instructors'}
                </h3>
                <LuUsers className="h-4 w-4 text-muted-foreground" />
              </div>
              {instructors.length > 0 ? instructors.map((instructor) => (
                <div key={instructor.id} className="flex items-center justify-between rounded-xl bg-sidebar p-2">
                  <div>
                    <p className="text-sm text-foreground">{instructor.full_name}</p>
                    <p className="text-xs text-muted-foreground">{instructor.specialization || 'Instructor'}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No instructors available yet in {profile.hub_location}.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [instructors, setInstructors] = useState<UserProfile[]>([]);
  const [assignedExercises, setAssignedExercises] = useState<InstructorExercise[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

        const dbXp = Number(profileRow?.xp || 0);
        const mdXp = Number(metadata?.['xp'] || 0);
        const xp = dbXp > 0 ? dbXp : mdXp;

        const dbStreak = Number(profileRow?.streak || 0);
        const mdStreak = Number(metadata?.['streak'] || 0);
        const streak = dbStreak > 0 ? dbStreak : mdStreak;

        const dbLastAct = String(profileRow?.last_activity_date || '');
        const mdLastAct = String(metadata?.['last_activity_date'] || '');
        const last_activity_date = dbLastAct ? dbLastAct : mdLastAct;

        const avatar_url = String(profileRow?.avatar_url || metadata?.['avatar_url'] || '');

        const profileData = {
          ...profileRow,
          id: user.id,
          email: user.email ?? profileRow?.email ?? '',
          full_name: String(profileRow?.full_name || metadata?.['full_name'] || user.email?.split('@')[0] || 'Learner'),
          role: String(profileRow?.role || metadata?.['role'] || metadata?.['user_role'] || 'student'),
          hub_location: String(profileRow?.hub_location || metadata?.['hub_location'] || ''),
          xp,
          streak,
          last_activity_date,
          avatar_url,
        } as unknown as UserProfile;

        setProfile(profileData);

        const hasRoleColumn = profileRow ? Object.prototype.hasOwnProperty.call(profileRow, 'role') : false;

        if (hasRoleColumn && profileData.role === 'instructor' && profileData.hub_location) {
          const { data: studentData, error: studentError } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .eq('hub_location', profileData.hub_location);

          if (!studentError && studentData) {
            setStudents(studentData as UserProfile[]);
          }
        }

        if (hasRoleColumn && profileData.hub_location) {
          // Load instructors for the hub location (relevant for both students and instructors viewing peers)
          const { data: instructorData, error: instructorError } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'instructor')
            .eq('hub_location', profileData.hub_location)
            .neq('id', profileData.id); // don't show self in the sidebar list

          if (!instructorError && instructorData) {
            setInstructors(instructorData as UserProfile[]);
          }
        }

        const normalizedRole = String(profileData.role || '').toLowerCase();
        if (normalizedRole === 'student') {
          const { data: exerciseRows, error: exerciseError } = await supabase
            .from('instructor_exercises')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

          if (!exerciseError && exerciseRows) {
            const instructorIds = Array.from(new Set(exerciseRows.map((row: any) => String(row.instructor_id)).filter(Boolean)));

            const instructorNameMap = new Map<string, string>();
            if (instructorIds.length > 0) {
              const { data: instructorRows, error: instructorRowsError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', instructorIds);

              if (!instructorRowsError && instructorRows) {
                instructorRows.forEach((row: any) => {
                  instructorNameMap.set(String(row.id), String(row.full_name || row.email || 'Instructor'));
                });
              }
            }

            setAssignedExercises(
              exerciseRows.map((row: any) => ({
                id: String(row.id),
                instructor_id: String(row.instructor_id),
                student_id: String(row.student_id),
                title: String(row.title || 'Untitled Exercise'),
                instructions: String(row.instructions || ''),
                language: row.language === 'javascript' ? 'javascript' : 'python',
                status: row.status || 'assigned',
                due_date: row.due_date ? String(row.due_date) : null,
                created_at: String(row.created_at || ''),
                submitted_at: row.submitted_at ? String(row.submitted_at) : null,
                instructor_name: instructorNameMap.get(String(row.instructor_id)) || 'Instructor',
              }))
            );
          } else if (exerciseError?.code !== '42P01') {
            console.error('Failed to load assigned exercises', exerciseError);
          }
        } else {
          setAssignedExercises([]);
        }

        // Load courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');

        if (!coursesError && coursesData) {
          setCourses(coursesData);
        }

        // Load user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (!progressError && progressData) {
          setUserProgress(progressData);
        }

      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  if (!profile) return null;
  if (profile.role === 'instructor') return null; // Instructors redirect away in layout

  const totalLessons = userProgress.filter(p => p.item_type === 'lesson' && p.status === 'completed').length;
  const coursesWithProgress = courses.map(course => {
    const p = userProgress.find(up => up.item_id === course.id && up.item_type === 'course');
    return {
      ...course,
      progress: p ? p.progress_percentage : 0,
    };
  });

  const inProgressCourses = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  const nextCourse = inProgressCourses[0] || courses[0] || { title: 'Explore Courses', id: 'explore' };

  return (
    <DashboardLayout>
      <DashboardMain
        profile={profile}
        students={students}
        instructors={instructors}
        courses={courses}
        xp={profile.xp || 0}
        level={calculateUserLevel(profile.xp)}
        streak={profile.streak || 0}
        completedLessons={totalLessons}
        nextCourse={nextCourse}
        inProgressCourses={inProgressCourses}
        assignedExercises={assignedExercises}
        userProgress={userProgress}
      />
    </DashboardLayout>
  );
}

