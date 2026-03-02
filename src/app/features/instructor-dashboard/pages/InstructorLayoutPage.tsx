import { Outlet } from 'react-router';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import InstructorSidebar from '../components/navigation/InstructorSidebar';

export default function InstructorLayoutPage() {
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
