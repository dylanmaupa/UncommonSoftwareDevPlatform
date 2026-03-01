import { useNavigate } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { Button } from '../ui/button';
import { LuArrowLeft } from 'react-icons/lu';

export default function LessonView() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
            <LuArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-semibold heading-font text-foreground mb-2">Lesson View</h1>
          <p className="text-sm text-muted-foreground">
            Lesson content is temporarily unavailable while this page is being rebuilt.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
