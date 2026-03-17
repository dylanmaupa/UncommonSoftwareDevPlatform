import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { 
  LuFileCheck, 
  LuFilter,
  LuClock,
  LuCircleCheck,
  LuCircleX,
  LuMessageSquare,
  LuCode,
  LuPlay,
  LuCheck,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuRotateCcw,
  LuMaximize,
  LuFileText,
} from 'react-icons/lu';
import { supabase } from '../../../../lib/supabase';
import ReviewAssignmentPage from './ReviewAssignmentPage';
import type { ReviewSubmission } from './ReviewAssignmentPage';

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  exerciseTitle: string;
  exerciseType: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  code?: string;
  testResults?: {
    passed: number;
    failed: number;
    total: number;
  };
  grade?: number;
  feedback?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [fullReviewSubmission, setFullReviewSubmission] = useState<ReviewSubmission | null>(null);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: exercises, error } = await supabase
        .from('instructor_exercises')
        .select('*')
        .eq('instructor_id', user.id)
        .neq('status', 'assigned')
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedSubmissions: Submission[] = [];

      if (exercises && exercises.length > 0) {
        // Fetch student profiles for names/emails
        const studentIds = Array.from(new Set(exercises.map((e: any) => e.student_id)));
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        const profileMap = new Map();
        if (profiles) {
          profiles.forEach((p: any) => profileMap.set(p.id, p));
        }

        for (const ex of exercises) {
          const studentProfile = profileMap.get(ex.student_id);
          formattedSubmissions.push({
            id: ex.id,
            studentName: studentProfile?.full_name || 'Unknown Student',
            studentEmail: studentProfile?.email || 'unknown@example.com',
            exerciseTitle: ex.title,
            exerciseType: ex.language || 'coding',
            submittedAt: new Date(ex.submitted_at).toLocaleDateString() + ' ' + new Date(ex.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: ex.status === 'submitted' ? 'pending' : (ex.status as any), // Map DB 'submitted' to UI 'pending'
            code: ex.submission_code,
            grade: ex.grade,
            feedback: ex.feedback
          });
        }
      }

      setSubmissions(formattedSubmissions);
    } catch (err) {
      console.error("Failed to load submissions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    return statusFilter === 'all' || sub.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-700 rounded-full">Pending</Badge>;
      case 'reviewed':
        return <Badge className="bg-indigo-100 text-indigo-700 rounded-full">Reviewed</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 rounded-full">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 rounded-full">Needs Revision</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full">{status}</Badge>;
    }
  };

  const handleApprove = async () => {
    if (selectedSubmission) {
      try {
        const numericGrade = parseInt(grade) || null;
        await supabase
          .from('instructor_exercises')
          .update({ 
            status: 'approved', 
            feedback,
            grade: numericGrade
          })
          .eq('id', selectedSubmission.id);
        
        setSelectedSubmission(null);
        setFeedback('');
        setGrade('');
        loadSubmissions();
      } catch (err) {
        console.error("Error approving submission", err);
      }
    }
  };

  const handleRequestRevision = async () => {
    if (selectedSubmission) {
      try {
        const numericGrade = parseInt(grade) || null;
        await supabase
          .from('instructor_exercises')
          .update({ 
            status: 'rejected', 
            feedback,
            grade: numericGrade
          })
          .eq('id', selectedSubmission.id);
        
        setSelectedSubmission(null);
        setFeedback('');
        setGrade('');
        loadSubmissions();
      } catch (err) {
        console.error("Error rejecting submission", err);
      }
    }
  };

  return (
    <>
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 heading-font">Submissions</h1>
          <p className="text-slate-500 mt-1 max-w-2xl">Manage and review student work, provide feedback, and track progress.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">{submissions.filter(s => s.status === 'pending').length} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
            <LuCircleCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">{submissions.filter(s => s.status === 'approved').length} Approved</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div>
        {/* Submissions List & Filters */}
        <div className="flex flex-col gap-4">
          
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <LuFilter className="h-4 w-4 text-slate-500" />
              </div>
              <span className="text-sm font-medium text-slate-700">Filter Status:</span>
              <select 
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="h-9 px-3 text-sm font-medium text-slate-800 bg-transparent border-none appearance-none focus:ring-0 cursor-pointer outline-none"
              >
                <option value="all">All Submissions</option>
                <option value="pending">Pending Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Needs Revision</option>
              </select>
            </div>
            
            <div className="text-sm text-slate-400 font-medium">
              Showing {filteredSubmissions.length} result{filteredSubmissions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Submissions Table List */}
          <Card className="rounded-2xl border-slate-200 bg-white overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Exercise</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((submission) => {
                      return (
                        <tr 
                          key={submission.id} 
                          className="transition-all duration-200 cursor-pointer group hover:bg-slate-50"
                          onClick={() => {
                            setFullReviewSubmission({
                              id: submission.id,
                              studentName: submission.studentName,
                              studentEmail: submission.studentEmail,
                              exerciseTitle: submission.exerciseTitle,
                              exerciseDescription: submission.exerciseTitle,
                              exerciseModule: '',
                              exerciseType: (submission.exerciseType === 'coding' ? 'coding' : 'written') as any,
                              language: submission.exerciseType === 'coding' ? 'python' : undefined,
                              submittedAt: submission.submittedAt,
                              submissionContent: submission.code || '',
                              existingGrade: submission.grade,
                              existingFeedback: submission.feedback,
                              status: submission.status,
                            });
                          }}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 transition-colors border-transparent group-hover:border-slate-200">
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-semibold">
                                  {submission.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{submission.studentName}</p>
                                <p className="text-xs text-slate-500 font-medium">{submission.studentEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {submission.exerciseType === 'coding' ? (
                                <LuCode className="h-4 w-4 text-indigo-400" />
                              ) : (
                                <LuFileText className="h-4 w-4 text-emerald-400" />
                              )}
                              <p className="text-sm font-medium text-slate-700">{submission.exerciseTitle}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">{getStatusBadge(submission.status)}</td>
                          <td className="px-5 py-4">
                            {submission.status === 'pending' ? (
                              <Button 
                                size="sm" 
                                className="h-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs shadow-sm font-medium px-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFullReviewSubmission({
                                    id: submission.id,
                                    studentName: submission.studentName,
                                    studentEmail: submission.studentEmail,
                                    exerciseTitle: submission.exerciseTitle,
                                    exerciseDescription: submission.exerciseTitle,
                                    exerciseModule: '',
                                    exerciseType: (submission.exerciseType === 'coding' ? 'coding' : 'written') as any,
                                    language: submission.exerciseType === 'coding' ? 'python' : undefined,
                                    submittedAt: submission.submittedAt,
                                    submissionContent: submission.code || '',
                                    existingGrade: submission.grade,
                                    existingFeedback: submission.feedback,
                                    status: submission.status,
                                  });
                                }}
                              >
                                Grade Now
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                <LuClock className="h-3.5 w-3.5" />
                                {submission.submittedAt}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Empty State */}
              {filteredSubmissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                    <LuCheck className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">
                    There are no submissions matching your current filters. Great job staying on top of the queue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

      {/* Full Review Page */}
      {fullReviewSubmission && (
        <ReviewAssignmentPage
          submission={fullReviewSubmission!}
          onClose={() => {
            setFullReviewSubmission(null);
            loadSubmissions();
          }}
          onSubmitReview={async (payload) => {
            try {
              await supabase
                .from('instructor_exercises')
                .update({
                  status: payload.action === 'approve' ? 'approved' : 'rejected',
                  feedback: payload.feedback,
                  grade: payload.grade,
                  reviewed_at: new Date().toISOString(),
                })
                .eq('id', payload.submissionId);
            } catch (err) {
              console.error('Error submitting review', err);
            }
          }}
        />
      )}
    </>
  );
}
