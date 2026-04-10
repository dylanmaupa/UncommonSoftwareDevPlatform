import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { supabase } from '../../../lib/supabase';
import { LuTarget, LuCircleCheck, LuClock, LuMessageSquare, LuStar } from 'react-icons/lu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface InstructorExercise {
  id: string;
  instructor_id: string;
  student_id: string;
  title: string;
  instructions: string;
  language: 'python' | 'javascript' | 'document';
  status: 'assigned' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  due_date: string | null;
  created_at: string;
  submitted_at: string | null;
  instructor_name?: string;
  formatting_requirements?: string | null;
  submission_document_name?: string | null;
  
  // Review specific fields
  grade?: number;
  feedback?: string;
}

export default function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<InstructorExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchAssignments() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted) navigate('/');
          return;
        }

        const { data: exerciseRows, error: exerciseError } = await supabase
          .from('instructor_exercises')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (exerciseError) {
          if (exerciseError.code !== '42P01') {
            console.error('Failed to load assignments', exerciseError);
          }
          return;
        }

        if (exerciseRows && exerciseRows.length > 0) {
          // Fetch instructor names
          const instructorIds = Array.from(new Set(exerciseRows.map((row: any) => String(row.instructor_id)).filter(Boolean)));
          const instructorNameMap = new Map<string, string>();
          
          if (instructorIds.length > 0) {
            const { data: instructorRows } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', instructorIds);

            if (instructorRows) {
              instructorRows.forEach((row: any) => {
                instructorNameMap.set(String(row.id), String(row.full_name || row.email || 'Instructor'));
              });
            }
          }

          const formattedAssignments = exerciseRows.map((row: any) => ({
            id: String(row.id),
            instructor_id: String(row.instructor_id),
            student_id: String(row.student_id),
            title: String(row.title || 'Untitled Exercise'),
            instructions: String(row.instructions || ''),
            language: row.language === 'javascript' ? 'javascript' : row.language === 'document' ? 'document' : 'python',
            status: row.status || 'assigned',
            due_date: row.due_date ? String(row.due_date) : null,
            created_at: String(row.created_at || ''),
            submitted_at: row.submitted_at ? String(row.submitted_at) : null,
            instructor_name: instructorNameMap.get(String(row.instructor_id)) || 'Instructor',
            grade: row.grade,
            feedback: row.feedback,
            formatting_requirements: row.formatting_requirements ? String(row.formatting_requirements) : null,
            submission_document_name: row.submission_document_name ? String(row.submission_document_name) : null,
          }));
          
          setAssignments(formattedAssignments as InstructorExercise[]);
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchAssignments();
    
    return () => { isMounted = false; };
  }, [navigate]);

  const pendingAssignments = assignments.filter((a) => ['assigned', 'submitted', 'rejected'].includes(a.status));
  const reviewedAssignments = assignments.filter((a) => ['reviewed', 'approved'].includes(a.status));

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto min-h-screen">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
              <LuTarget className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 heading-font lowercase">My Assignments</h1>
              <p className="text-sm text-slate-500">Track and manage exercises assigned by your instructors.</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            Loading assignments...
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="flex gap-2 relative">
                Pending
                {pendingAssignments.length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {pendingAssignments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviewed" className="flex gap-2 relative">
                Reviewed
                {reviewedAssignments.length > 0 && (
                  <span className="ml-1 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {reviewedAssignments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ─── PENDING TAB ─── */}
            <TabsContent value="pending" className="mt-0 space-y-4">
              {pendingAssignments.length === 0 ? (
                <Card className="border-dashed shadow-none">
                  <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                    <LuCircleCheck className="h-8 w-8 text-emerald-500 mb-3" />
                    <p className="text-slate-600 font-medium tracking-tight">You're all caught up!</p>
                    <p className="text-slate-400 text-sm mt-1">No pending assignments at the moment.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pendingAssignments.map((assignment) => {
                    const statusTone = assignment.status === 'submitted' 
                      ? 'bg-amber-100 text-amber-700 border-amber-200' 
                      : assignment.status === 'rejected'
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200';
                      
                    const isLate = assignment.due_date && (
                      assignment.status === 'assigned'
                        ? new Date() > new Date(assignment.due_date)
                        : (assignment.submitted_at && new Date(assignment.submitted_at) > new Date(assignment.due_date))
                    );

                    return (
                      <Card key={assignment.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-3">
                            <Badge className={statusTone}>
                              {assignment.status === 'submitted' ? 'Pending Review' : assignment.status === 'rejected' ? 'Needs Revision' : 'Pending'}
                            </Badge>
                            {assignment.language && (
                              <Badge variant="outline" className="text-[10px] uppercase text-slate-500">
                                {assignment.language === 'document' ? 'document upload' : assignment.language}
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-slate-900 mb-1" title={assignment.title}>{assignment.title}</h3>
                          <p className="text-xs text-slate-500 mb-3">From {assignment.instructor_name}</p>
                          
                          <p className="text-sm text-slate-600 mb-4 flex-1 leading-relaxed">
                            {assignment.status === 'rejected' && assignment.feedback 
                              ? `Feedback: ${assignment.feedback}` 
                              : assignment.instructions || 'No detailed instructions provided. Open the assignment workspace to begin.'}
                          </p>
                          {assignment.language === 'document' && assignment.formatting_requirements && (
                            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500 mb-1">Formatting Requirements</p>
                              <p className="text-xs text-blue-800 leading-relaxed">{assignment.formatting_requirements}</p>
                            </div>
                          )}
                          
                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className={`flex items-center text-xs gap-1 ${isLate ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                              <LuClock className="h-3.5 w-3.5" />
                              {assignment.due_date ? `Due ${new Date(assignment.due_date).toLocaleDateString()}` : 'No due date'}
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={() => navigate(`/sandbox?exerciseId=${assignment.id}`)}
                              className="rounded-full shadow-sm"
                            >
                              {assignment.language === 'document'
                                ? assignment.status === 'submitted' ? 'View upload' : 'Upload document'
                                : assignment.status === 'submitted' ? 'View' : 'Start working'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ─── REVIEWED TAB ─── */}
            <TabsContent value="reviewed" className="mt-0 space-y-4">
              {reviewedAssignments.length === 0 ? (
                <Card className="border-dashed shadow-none">
                  <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                    <LuClock className="h-8 w-8 text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium tracking-tight">No reviewed assignments yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Submissions graded by instructors will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviewedAssignments.map((assignment) => {
                    const gradeColor = 
                      !assignment.grade ? 'text-slate-700 bg-slate-100'
                      : assignment.grade >= 80 ? 'text-emerald-700 bg-emerald-100'
                      : assignment.grade >= 60 ? 'text-amber-700 bg-amber-100'
                      : 'text-rose-700 bg-rose-100';

                    return (
                      <Card key={assignment.id} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="p-5 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 mb-1">{assignment.title}</h3>
                            <p className="text-xs text-slate-500 mb-4">Graded by {assignment.instructor_name}</p>
                            
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                <LuStar className="h-3.5 w-3.5" /> Final Grade 
                              </span>
                              <div className={`px-2.5 py-1 rounded-md font-bold text-sm ${gradeColor}`}>
                                {assignment.grade != null ? `${assignment.grade}/100` : 'N/A'}
                              </div>
                            </div>

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => navigate(`/sandbox?exerciseId=${assignment.id}`)}
                            >
                              {assignment.language === 'document' ? 'View Submitted Document' : 'View Submission Code'}
                            </Button>
                          </div>
                          
                          <div className="p-5 sm:w-2/3">
                            <span className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                              <LuMessageSquare className="h-3.5 w-3.5" /> Instructor Feedback
                            </span>
                            {assignment.feedback ? (
                              <div className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                                {assignment.feedback}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 italic mt-2">No written feedback provided.</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
