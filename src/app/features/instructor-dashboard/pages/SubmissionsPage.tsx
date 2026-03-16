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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Submissions List & Filters */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          
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
                      const isSelected = selectedSubmission?.id === submission.id;
                      return (
                        <tr 
                          key={submission.id} 
                          className={`transition-all duration-200 cursor-pointer group
                            ${isSelected ? 'bg-blue-50/40 relative' : 'hover:bg-slate-50'}
                          `}
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setFeedback(submission.feedback || '');
                            setGrade(submission.grade ? submission.grade.toString() : '');
                          }}
                        >
                          {/* Active Indicator Line */}
                          {isSelected && (
                            <td className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                          )}
                          
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className={`h-9 w-9 border-2 transition-colors ${isSelected ? 'border-blue-200' : 'border-transparent group-hover:border-slate-200'}`}>
                                <AvatarFallback className={`${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} text-xs font-semibold`}>
                                  {submission.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{submission.studentName}</p>
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
                              <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{submission.exerciseTitle}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">{getStatusBadge(submission.status)}</td>
                          <td className="px-5 py-4">
                            {submission.status === 'pending' && !isSelected ? (
                              <Button 
                                size="sm" 
                                className="h-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs shadow-sm font-medium px-4"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubmission(submission);
                                  setFeedback(submission.feedback || '');
                                  setGrade(submission.grade ? submission.grade.toString() : '');
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

        {/* Right Column: Sticky Review Panel */}
        <div className="xl:col-span-4 sticky top-6">
          {selectedSubmission ? (
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col h-[calc(100vh-120px)] xl:h-auto">
              {/* Panel Header */}
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm bg-white">
                      <AvatarFallback className="bg-transparent text-slate-700 font-bold text-sm">
                        {selectedSubmission.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-none">{selectedSubmission.studentName}</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 pr-2 truncate max-w-[180px]" title={selectedSubmission.exerciseTitle}>
                        {selectedSubmission.exerciseTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-100 bg-blue-50 transition-colors"
                      title="Open Full Review Environment"
                      onClick={() => {
                        setFullReviewSubmission({
                          id: selectedSubmission.id,
                          studentName: selectedSubmission.studentName,
                          studentEmail: selectedSubmission.studentEmail,
                          exerciseTitle: selectedSubmission.exerciseTitle,
                          exerciseDescription: selectedSubmission.exerciseTitle,
                          exerciseModule: '',
                          exerciseType: (selectedSubmission.exerciseType === 'coding' ? 'coding' : 'written') as any,
                          language: selectedSubmission.exerciseType === 'coding' ? 'python' : undefined,
                          submittedAt: selectedSubmission.submittedAt,
                          submissionContent: selectedSubmission.code || '',
                          existingGrade: selectedSubmission.grade,
                          existingFeedback: selectedSubmission.feedback,
                          status: selectedSubmission.status,
                        });
                      }}
                    >
                      <LuMaximize className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 bg-slate-100 transition-colors"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      <LuX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Panel Content (Scrollable) */}
              <div className="p-5 flex-1 overflow-y-auto space-y-6 custom-scrollbar bg-white">
                
                {/* Status & Timing */}
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <LuClock className="h-4 w-4 text-slate-400" />
                    {selectedSubmission.submittedAt}
                  </div>
                  {getStatusBadge(selectedSubmission.status)}
                </div>

                {/* Code Preview (for coding exercises) */}
                {selectedSubmission.exerciseType === 'coding' && selectedSubmission.code && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <LuCode className="h-4 w-4 text-indigo-500" />
                      <h4 className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                        Code Snapshot
                      </h4>
                    </div>
                    <div className="bg-[#0d1117] rounded-xl p-4 overflow-x-auto max-h-[160px] shadow-sm custom-scrollbar relative group border border-slate-800">
                      <pre className="text-[11px] leading-relaxed text-slate-300 font-mono">
                        <code>{selectedSubmission.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                <div className="h-px w-full bg-slate-100" />

                {/* Quick Grade */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Score (0-100)</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      min="0" 
                      max="100"
                      placeholder="Enter grade..."
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="h-12 pl-4 pr-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 font-bold text-slate-900 text-base shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none pointer-events-none">%</div>
                  </div>
                </div>

                {/* Quick Feedback */}
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Instructor Feedback</span>
                  </label>
                  <Textarea 
                    placeholder="Write detailed feedback here..."
                    className="min-h-[140px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none text-sm placeholder:text-slate-400 leading-relaxed shadow-sm p-4"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2 pb-2">
                  <Button 
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all text-sm font-bold h-12"
                    onClick={handleApprove}
                    disabled={!grade || !feedback}
                  >
                    <LuCircleCheck className="h-5 w-5 mr-2 opacity-90" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 shadow-sm transition-all text-sm font-bold h-12"
                    onClick={handleRequestRevision}
                    disabled={!feedback}
                  >
                    <LuRotateCcw className="h-5 w-5 mr-2 opacity-90" />
                    Revise
                  </Button>
                </div>

              </div>
            </Card>
            ) : (
              /* Empty Right Column */
              <div className="h-[300px] xl:h-[600px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 transform -rotate-6">
                  <LuFileCheck className="h-7 w-7 text-slate-300" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Select a submission</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-[200px]">
                  Click on any row in the queue to view quick grading options.
                </p>
              </div>
            )}
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
