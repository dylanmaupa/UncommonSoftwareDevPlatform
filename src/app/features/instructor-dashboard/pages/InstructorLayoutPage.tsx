import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router';
import {
  LuChevronRight,
  LuEllipsis,
  LuSearch,
  LuSparkles,
  LuTarget,
} from 'react-icons/lu';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { supabase } from '../../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../../lib/profileAccess';
import { calculateProgressPercentage } from '../data/selectors';
import { InstructorContext, useComputeInstructorData } from '../hooks/useInstructorData';

export default function InstructorLayoutPage() {
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasInstructorAccess, setHasInstructorAccess] = useState(false);

  const [hubLocation, setHubLocation] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  const instructorData = useComputeInstructorData(hubLocation, userFullName, userEmail);
  const { instructor, instructorHub, instructorStudents } = instructorData;

  const averageProgress = useMemo(() => {
    if (instructorStudents.length === 0) return 0;
    const total = instructorStudents.reduce((sum, student) => sum + calculateProgressPercentage(student.progress), 0);
    return Math.round(total / instructorStudents.length);
  }, [instructorStudents]);

  const atRisk = useMemo(() => {
    return instructorStudents.filter((student) => student.riskLevel === 'at-risk').length;
  }, [instructorStudents]);

  useEffect(() => {
    let isMounted = true;

    const verifyInstructorAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        setHasInstructorAccess(false);
        setIsCheckingAccess(false);
        navigate('/', { replace: true });
        return;
      }

      const profileRow = await fetchProfileForAuthUser(user as any);

      if (!isMounted) return;
      const metadata = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;
      const role = String(
        profileRow?.['role'] ??
          profileRow?.['user_role'] ??
          metadata?.['role'] ??
          metadata?.['user_role'] ??
          ''
      ).toLowerCase();
      const isInstructor = role === 'instructor';

      const hubLoc = profileRow?.['hub_location'] ?? metadata?.['hub_location'] ?? '';
      const fName = profileRow?.['full_name'] ?? metadata?.['full_name'] ?? '';
      const uEmail = user.email ?? profileRow?.['email'] ?? '';
      
      setHubLocation(String(hubLoc));
      setUserFullName(String(fName));
      setUserEmail(String(uEmail));

      setHasInstructorAccess(isInstructor);
      setIsCheckingAccess(false);

      if (!isInstructor) {
        navigate('/dashboard', { replace: true });
      }
    };

    verifyInstructorAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (isCheckingAccess || !hasInstructorAccess) {
    return null;
  }

  return (
    <InstructorContext.Provider value={instructorData}>
      <DashboardLayout>
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
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
                  <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
                    <Link to="/instructor/live" aria-label="Live Ops">
                      <LuTarget className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
                    <Link to="/instructor/assessments" aria-label="Assessments">
                      <LuSparkles className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="order-3 ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={instructorStudents[0]?.avatarUrl ?? ''} alt={instructor.fullName} />
                    <AvatarFallback>{instructor.fullName?.[0] ?? 'I'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden pr-2 text-sm text-foreground sm:block">{instructor.fullName}</span>
                </div>
              </div>

              <main className="min-w-0">
                <Outlet />
              </main>
            </div>

            <aside className="space-y-4">
              <Card className="rounded-2xl border-border">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base text-foreground heading-font">Profile Overview</h3>
                    <LuEllipsis className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 border border-border">
                      <AvatarImage src={instructorStudents[0]?.avatarUrl ?? ''} alt={instructor.fullName} />
                      <AvatarFallback>{instructor.fullName?.[0] ?? 'I'}</AvatarFallback>
                    </Avatar>
                    <p className="mt-3 text-base text-foreground">Good Morning {instructor.fullName}</p>
                    <p className="text-xs text-muted-foreground">Hub: {instructorHub?.name ?? 'Not assigned'}</p>
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
                      <span>Students</span>
                      <span>Progress</span>
                      <span>Risk</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Students: {instructorStudents.length}</div>
                    <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Progress: {averageProgress}%</div>
                    <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">At Risk: {atRisk}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base text-foreground heading-font">Quick Access</h3>
                    <LuTarget className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {[
                    ['Students', '/instructor/students'],
                    ['Curriculum', '/instructor/curriculum'],
                    ['Assessments', '/instructor/assessments'],
                    ['Projects', '/instructor/projects'],
                    ['Live Ops', '/instructor/live'],
                    ['Hub Ops', '/instructor/hub-operations'],
                  ].map(([label, href]) => (
                    <Link key={label} to={href} className="flex items-center justify-between rounded-xl bg-sidebar p-2">
                      <span className="text-sm text-foreground">{label}</span>
                      <LuChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </DashboardLayout>
    </InstructorContext.Provider>
  );
}


