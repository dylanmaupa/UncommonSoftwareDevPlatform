import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { supabase } from '../../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../../lib/profileAccess';
import InstructorSidebar from '../components/navigation/InstructorSidebar';

export default function InstructorLayoutPage() {
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasInstructorAccess, setHasInstructorAccess] = useState(false);

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
    <DashboardLayout>
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <InstructorSidebar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
