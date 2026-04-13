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
  is_assigned_to_me?: boolean;
  
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

        // Get student's hub location
        const { data: studentProfile, error: profileError } = await supabase
          .from('profiles')
          .select('hub_location')
          .eq('id', user.id)
          .single();

        if (profileError || !studentProfile?.hub_location) {
          console.error('Failed to get student hub location:', profileError);
          if (isMounted) setIsLoading(false);
          return;
        }

        const studentHub = studentProfile.hub_location;

        // Find all instructors in the same hub
        const { data: instructors, error: instructorsError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'instructor')
          .eq('hub_location', studentHub);

        if (instructorsError) {
          console.error('Failed to get instructors:', instructorsError);
        }

        const instructorIds = instructors?.map((i: any) => i.id) || [];
        const instructorNameMap = new Map<string, string>();
        
        if (instructors) {
          instructors.forEach((row: any) => {
            instructorNameMap.set(String(row.id), String(row.full_name || row.email || 'Instructor'));
          });
        }

        // Fetch all exercises from instructors in this hub
        // Join with instructor_exercises to get student-specific data
        let exerciseRows: any[] = [];
        
        if (instructorIds.length > 0) {
          const { data: exercises, error: exerciseError } = await supabase
            .from('instructor_exercises')
            .select('*')
            .in('instructor_id', instructorIds)
            .order('created_at', { ascending: false });

          if (exerciseError) {
            if (exerciseError.code !== '42P01') {
              console.error('Failed to load assignments', exerciseError);
            }
          } else {
            exerciseRows = exercises || [];
          }
        }

        // Also get exercises assigned specifically to this student
        const { data: myExercises, error: myExercisesError } = await supabase
          .from('instructor_exercises')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (!myExercisesError && myExercises) {
          // Merge and deduplicate by id
          const existingIds = new Set(exerciseRows.map(e => e.id));
          myExercises.forEach((ex: any) => {
            if (!existingIds.has(ex.id)) {
              exerciseRows.push(ex);
            }
          });
        }

        if (!isMounted) return;

        if (exerciseRows.length > 0) {
          // Get instructor names for any missing instructors
          const missingInstructorIds = Array.from(new Set(
            exerciseRows
              .map((row: any) => String(row.instructor_id))
              .filter((id: string) => id && !instructorNameMap.has(id))
          ));

          if (missingInstructorIds.length > 0) {
            const { data: missingInstructors } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', missingInstructorIds);

            if (missingInstructors) {
              missingInstructors.forEach((row: any) => {
                instructorNameMap.set(String(row.id), String(row.full_name || row.email || 'Instructor'));
              });
            }
          }

          const formattedAssignments = exerciseRows.map((row: any) => {
            const isAssignedToMe = row.student_id === user.id;
            const isCompleted = ['submitted', 'reviewed', 'approved', 'rejected'].includes(row.status);
            
            return {
              id: String(row.id),
              instructor_id: String(row.instructor_id),
              student_id: String(row.student_id || user.id),
              title: String(row.title || 'Untitled Exercise'),
              instructions: String(row.instructions || ''),
              language: row.language === 'javascript' ? 'javascript' : row.language === 'document' ? 'document' : 'python',
              status: isAssignedToMe ? row.status : (isCompleted ? row.status : 'assigned'),
              due_date: row.due_date ? String(row.due_date) : null,
              created_at: String(row.created_at || ''),
              submitted_at: row.submitted_at ? String(row.submitted_at) : null,
              instructor_name: instructorNameMap.get(String(row.instructor_id)) || 'Instructor',
              grade: isAssignedToMe ? row.grade : undefined,
              feedback: isAssignedToMe ? row.feedback : undefined,
              formatting_requirements: row.formatting_requirements ? String(row.formatting_requirements) : null,
              submission_document_name: row.submission_document_name ? String(row.submission_document_name) : null,
              is_assigned_to_me: isAssignedToMe,
            };
          });
          
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

  const allAssignments = assignments;
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
              <h1 className="text-2xl font-bold text-slate-900 heading-font lowercase">Hub Assignments</h1>
              <p className="text-sm text-slate-500">View all assignments from instructors in your hub.</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            Loading assignments...
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="flex gap-2 relative">
                All
                {allAssignments.length > 0 && (
                  <span className="ml-1 bg-slate-100 text-slate-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {allAssignments.length}
                  </span>
                )}
              </TabsTrigger>
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
                  <span className="ml-1 bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {reviewedAssignments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ─── ALL TAB ─── */}
            <TabsContent value="all" className="mt-0 space-y-4">
              {allAssignments.length === 0 ? (
                <Card className="border-dashed shadow-none">
                  <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                    <LuTarget className="h-8 w-8 text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium tracking-tight">No assignments available</p>
                    <p className="text-slate-400 text-sm mt-1">No assignments have been created in your hub yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {allAssignments.map((assignment) => {
                    const gradeColor = 
                      !assignment.grade ? 'text-slate-700 bg-slate-100'
                      : assignment.grade >= 80 ? 'text-emerald-700 bg-emerald-100'
                      : assignment.grade >= 60 ? 'text-amber-700 bg-amber-100'
                      : 'text-rose-700 bg-rose-100';

                    const statusBadge = assignment.status === 'approved' 
                      ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>
                      : assignment.status === 'reviewed'
                        ? <Badge className="bg-blue-100 text-blue-700 border-blue-200">Reviewed</Badge>
                        : assignment.status === 'rejected'
                          ? <Badge className="bg-rose-100 text-rose-700 border-rose-200">Needs Revision</Badge>
                          : assignment.status === 'submitted'
                            ? <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Review</Badge>
                            : assignment.is_assigned_to_me === false
                              ? <Badge variant="outline" className="text-slate-500">Not Assigned</Badge>
                              : <Badge className="bg-blue-100 text-blue-700 border-blue-200">Pending</Badge>;

                    return (
                      <Card key={assignment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row">
                          <div className="p-5 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                              {assignment.is_assigned_to_me === false && (
                                <Badge variant="outline" className="text-[10px] ml-2 shrink-0">Hub Assignment</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mb-3">From {assignment.instructor_name}</p>
                            
                            <div className="flex items-center gap-2 mb-3">
                              {statusBadge}
                              {assignment.language && (
                                <Badge variant="outline" className="text-[10px] uppercase text-slate-500">
                                  {assignment.language === 'document' ? 'document' : assignment.language}
                                </Badge>
                              )}
                            </div>

                            {assignment.grade != null && assignment.is_assigned_to_me !== false && (
                              <div className={`px-2.5 py-1 rounded-md font-bold text-sm inline-block ${gradeColor}`}>
                                {assignment.grade}/100
                              </div>
                            )}
                          </div>
                          
                          <div className="p-5 sm:w-2/3 flex flex-col">
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {assignment.instructions || 'No detailed instructions provided.'}
                            </p>
                            
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center text-xs text-slate-500 gap-4">
                                <span className="flex items-center gap-1">
                                  <LuClock className="h-3.5 w-3.5" />
                                  {assignment.due_date ? `Due ${new Date(assignment.due_date).toLocaleDateString()}` : 'No due date'}
                                </span>
                                {assignment.submitted_at && (
                                  <span className="flex items-center gap-1 text-emerald-600">
                                    <LuCircleCheck className="h-3.5 w-3.5" />
                                    Submitted
                                  </span>
                                )}
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant={assignment.is_assigned_to_me === false ? 'outline' : 'default'}
                                disabled={assignment.is_assigned_to_me === false}
                                onClick={() => navigate(`/sandbox?exerciseId=${assignment.id}`)}
                                className="rounded-full text-xs"
                              >
                                {assignment.is_assigned_to_me === false 
                                  ? 'Not Available' 
                                  : ['reviewed', 'approved', 'rejected'].includes(assignment.status)
                                    ? 'View Results'
                                    : assignment.status === 'submitted'
                                      ? 'View Submission'
                                      : 'Start Working'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

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
                        : assignment.is_assigned_to_me === false
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200';
                      
                    const isLate = assignment.due_date && (
                      assignment.status === 'assigned'
                        ? new Date() > new Date(assignment.due_date)
                        : (assignment.submitted_at && new Date(assignment.submitted_at) > new Date(assignment.due_date))
                    );

                    const isNotMine = assignment.is_assigned_to_me === false;

                    return (
                      <Card key={assignment.id} className={`flex flex-col h-full hover:shadow-md transition-shadow ${isNotMine ? 'opacity-75' : ''}`}>
                        <CardContent className="p-5 flex flex-col h-full">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                              <Badge className={statusTone}>
                                {assignment.status === 'submitted' ? 'Pending Review' : assignment.status === 'rejected' ? 'Needs Revision' : isNotMine ? 'Not Assigned to You' : 'Pending'}
                              </Badge>
                              {isNotMine && assignment.status !== 'assigned' && (
                                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                                  Completed by others
                                </Badge>
                              )}
                            </div>
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
                              disabled={isNotMine}
                              variant={isNotMine ? 'outline' : 'default'}
                            >
                              {isNotMine 
                                ? 'Not Available' 
                                : assignment.language === 'document'
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

                    const isNotMine = assignment.is_assigned_to_me === false;

                    return (
                      <Card key={assignment.id} className={`overflow-hidden ${isNotMine ? 'opacity-75' : ''}`}>
                        <div className="flex flex-col sm:flex-row">
                          <div className="p-5 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                              {isNotMine && (
                                <Badge variant="outline" className="text-[10px] ml-2 shrink-0">Hub Assignment</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Graded by {assignment.instructor_name}</p>
                            
                            {isNotMine ? (
                              <div className="mb-4">
                                <Badge variant="outline" className="bg-slate-50 text-slate-500">
                                  Not Assigned to You
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                  <LuStar className="h-3.5 w-3.5" /> Final Grade 
                                </span>
                                <div className={`px-2.5 py-1 rounded-md font-bold text-sm ${gradeColor}`}>
                                  {assignment.grade != null ? `${assignment.grade}/100` : 'N/A'}
                                </div>
                              </div>
                            )}

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => navigate(`/sandbox?exerciseId=${assignment.id}`)}
                              disabled={isNotMine}
                            >
                              {isNotMine ? 'Not Available' : assignment.language === 'document' ? 'View Submitted Document' : 'View Submission Code'}
                            </Button>
                          </div>
                          
                          <div className="p-5 sm:w-2/3">
                            <span className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                              <LuMessageSquare className="h-3.5 w-3.5" /> Instructor Feedback
                            </span>
                            {assignment.feedback && !isNotMine ? (
                              <div className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                                {assignment.feedback}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 italic mt-2">
                                {isNotMine ? 'Assignment not assigned to you.' : 'No written feedback provided.'}
                              </p>
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
