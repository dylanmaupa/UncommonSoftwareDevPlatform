import { Link, useNavigate } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import dashboardAvatar from '../../../assets/avatar2.png';
import { Card, CardContent } from '../ui/card';
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
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor';
  hub_location: string;
  specialization?: string | null;
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
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
                <LuBell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
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
              <p className="text-xs uppercase tracking-wider text-white/80">Online Course</p>
              <h2 className="heading-font mt-2 max-w-md text-2xl leading-tight text-white sm:text-3xl">
                Sharpen Your Skills with Professional Online Courses
              </h2>
              <p className="mt-2 text-sm text-white/80">Continue with: {nextCourse.title}</p>
              <Button className="mt-5 rounded-full bg-white text-foreground hover:bg-white/90">
                Join Now
                <LuArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">24 watched</p>
                  <p className="text-sm text-foreground">UI/UX Design</p>
                </div>
                <LuTarget className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">24 watched</p>
                  <p className="text-sm text-foreground">Branding</p>
                </div>
                <LuFlame className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">40 watched</p>
                  <p className="text-sm text-foreground">Front End</p>
                </div>
                <LuBookOpen className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          {inProgressCourses.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg text-foreground heading-font">Timeline</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                  <LuChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {inProgressCourses.slice(0, 3).map((course) => (
                  <Card key={course.id} className="rounded-2xl border-border">
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
                ))}
              </div>
            </div>
          )}

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-lg text-foreground heading-font">
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
                              <Button size="sm" className="h-8 rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90">
                                Start
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
                <h3 className="text-base text-foreground heading-font">Profile Overview</h3>
                <LuEllipsis className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border border-border">
                  <AvatarImage src={dashboardAvatar} alt={nickname} />
                  <AvatarFallback>{nickname ? nickname[0] : 'U'}</AvatarFallback>
                </Avatar>
                <p className="mt-3 text-base text-foreground">Good Morning {nickname}</p>
                <p className="text-xs text-muted-foreground">{profile.role === 'instructor' ? `Hub: ${profile.hub_location}` : 'Continue your journey to your target'}</p>
              </div>
              <div className="rounded-2xl bg-secondary p-3">
                <div className="mb-2 flex items-end gap-2">
                  <div className="h-8 w-8 rounded-md bg-primary/30" />
                  <div className="h-12 w-8 rounded-md bg-primary/70" />
                  <div className="h-9 w-8 rounded-md bg-primary/40" />
                  <div className="h-14 w-8 rounded-md bg-primary" />
                  <div className="h-8 w-8 rounded-md bg-primary/30" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>10-10 Aug</span>
                  <span>11-20 Aug</span>
                  <span>21-30 Aug</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">XP: {xp}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Level: {level}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Streak: {streak}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Lessons: {completedLessons}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">
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
                  <Button variant="ghost" size="sm" className="h-8 rounded-full border border-border text-xs text-muted-foreground">
                    Follow
                  </Button>
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

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) {
          console.error("Failed to load profile", profileError);
          // Optional: handle user with no profile gracefully
          return;
        }

        setProfile(profileData);

        if (profileData.role === 'instructor') {
          const { data: studentData, error: studentError } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .eq('hub_location', profileData.hub_location);

          if (!studentError && studentData) {
            setStudents(studentData);
          }
        }

        // Load instructors for the hub location (relevant for both students and instructors viewing peers)
        const { data: instructorData, error: instructorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'instructor')
          .eq('hub_location', profileData.hub_location)
          .neq('id', profileData.id); // don't show self in the sidebar list

        if (!instructorError && instructorData) {
          setInstructors(instructorData);
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
        xp={0} // Mocked out for now
        level={1} // Mocked out for now
        streak={0} // Mocked out for now
        completedLessons={totalLessons}
        nextCourse={nextCourse}
        inProgressCourses={inProgressCourses}
      />
    </DashboardLayout>
  );
}
