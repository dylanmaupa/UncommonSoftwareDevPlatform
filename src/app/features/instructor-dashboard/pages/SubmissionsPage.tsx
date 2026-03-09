import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Textarea } from '../../../components/ui/textarea';
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
  LuRotateCcw
} from 'react-icons/lu';

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

const mockSubmissions: Submission[] = [
  {
    id: '1',
    studentName: 'John Anderson',
    studentEmail: 'john@example.com',
    exerciseTitle: 'React Hooks Challenge',
    exerciseType: 'coding',
    submittedAt: '2 hours ago',
    status: 'pending',
    code: `function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}`,
    testResults: {
      passed: 3,
      failed: 1,
      total: 4
    }
  },
  {
    id: '2',
    studentName: 'Sarah Mitchell',
    studentEmail: 'sarah@example.com',
    exerciseTitle: 'JavaScript Basics Quiz',
    exerciseType: 'quiz',
    submittedAt: '4 hours ago',
    status: 'reviewed',
    grade: 85,
    feedback: 'Great work! Review question 3 about closures.'
  },
  {
    id: '3',
    studentName: 'Michael Chen',
    studentEmail: 'michael@example.com',
    exerciseTitle: 'API Integration Task',
    exerciseType: 'coding',
    submittedAt: '5 hours ago',
    status: 'approved',
    grade: 92,
    feedback: 'Excellent implementation with proper error handling.'
  },
  {
    id: '4',
    studentName: 'Emily Rodriguez',
    studentEmail: 'emily@example.com',
    exerciseTitle: 'CSS Grid Layout',
    exerciseType: 'coding',
    submittedAt: '6 hours ago',
    status: 'pending',
    code: `.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,
    testResults: {
      passed: 2,
      failed: 2,
      total: 4
    }
  },
  {
    id: '5',
    studentName: 'David Kim',
    studentEmail: 'david@example.com',
    exerciseTitle: 'State Management',
    exerciseType: 'coding',
    submittedAt: '8 hours ago',
    status: 'rejected',
    grade: 45,
    feedback: 'Please review Redux fundamentals and resubmit.'
  },
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState('');

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

  const handleApprove = () => {
    if (selectedSubmission) {
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, status: 'approved', feedback }
          : sub
      ));
      setSelectedSubmission(null);
      setFeedback('');
    }
  };

  const handleRequestRevision = () => {
    if (selectedSubmission) {
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, status: 'rejected', feedback }
          : sub
      ));
      setSelectedSubmission(null);
      setFeedback('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submissions & Grading</h1>
          <p className="text-slate-500 mt-1">Review student submissions and provide feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-700 rounded-full px-3 py-1">
            <LuFileCheck className="h-3 w-3 mr-1" />
            {submissions.filter(s => s.status === 'pending').length} Pending
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1">
            <LuCircleCheck className="h-3 w-3 mr-1" />
            {submissions.filter(s => s.status === 'approved').length} Approved
          </Badge>
        </div>
      </div>

      {/* Filter */}
      <Card className="rounded-2xl border-blue-200/60 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <LuFilter className="h-4 w-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Submissions</option>
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Needs Revision</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <Card className="rounded-2xl border-blue-200/60 bg-white lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Review Queue</CardTitle>
            <CardDescription>Student submissions awaiting your review</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500 bg-slate-50/50">
                    <th className="px-4 py-3 font-medium text-left">Student</th>
                    <th className="px-4 py-3 font-medium text-left">Exercise</th>
                    <th className="px-4 py-3 font-medium text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-left">Submitted</th>
                    <th className="px-4 py-3 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr 
                      key={submission.id} 
                      className={`border-b border-slate-50 last:border-b-0 hover:bg-blue-50/30 transition-colors cursor-pointer ${
                        selectedSubmission?.id === submission.id ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setFeedback(submission.feedback || '');
                      }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                              {submission.studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-slate-900">{submission.studentName}</p>
                            <p className="text-xs text-slate-500">{submission.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-900">{submission.exerciseTitle}</p>
                        <p className="text-xs text-slate-500 capitalize">{submission.exerciseType}</p>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(submission.status)}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <LuClock className="h-3 w-3" />
                          {submission.submittedAt}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Button 
                          size="sm" 
                          className={`rounded-full h-8 text-xs ${
                            submission.status === 'pending' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setFeedback(submission.feedback || '');
                          }}
                        >
                          {submission.status === 'pending' ? 'Review' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <LuFileCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No submissions found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Panel */}
        <div className="space-y-6">
          {selectedSubmission ? (
            <>
              <Card className="rounded-2xl border-blue-200/60 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900">Review Submission</CardTitle>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      <LuX className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    {selectedSubmission.exerciseTitle} by {selectedSubmission.studentName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-lg">
                        {selectedSubmission.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{selectedSubmission.studentName}</p>
                      <p className="text-sm text-slate-500">{selectedSubmission.studentEmail}</p>
                      <p className="text-xs text-slate-400">Submitted {selectedSubmission.submittedAt}</p>
                    </div>
                  </div>

                  {/* Code Preview (for coding exercises) */}
                  {selectedSubmission.code && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-slate-900 flex items-center gap-2">
                          <LuCode className="h-4 w-4 text-blue-600" />
                          Code Submission
                        </h4>
                        <Button size="sm" variant="outline" className="rounded-full h-8 text-xs">
                          <LuPlay className="mr-1 h-3 w-3" />
                          Run Tests
                        </Button>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-sm text-slate-300 font-mono">
                          <code>{selectedSubmission.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Test Results */}
                  {selectedSubmission.testResults && (
                    <div className="p-4 rounded-xl bg-slate-50">
                      <h4 className="font-medium text-sm text-slate-900 mb-3">Test Results</h4>
                      <div className="space-y-2">
                        {Array.from({ length: selectedSubmission.testResults.total }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {i < selectedSubmission.testResults!.passed ? (
                              <LuCheck className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <LuX className="h-4 w-4 text-rose-500" />
                            )}
                            <span className="text-sm text-slate-700">Test {i + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                          {selectedSubmission.testResults.passed}/{selectedSubmission.testResults.total} tests passed
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Grade Display */}
                  {selectedSubmission.grade !== undefined && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Grade</p>
                          <p className="text-2xl font-bold text-blue-900">{selectedSubmission.grade}%</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">
                          <LuCircleCheck className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div>
                    <h4 className="font-medium text-sm text-slate-900 mb-2 flex items-center gap-2">
                      <LuMessageSquare className="h-4 w-4 text-blue-600" />
                      Instructor Feedback
                    </h4>
                    <Textarea 
                      placeholder="Provide feedback to the student..."
                      value={feedback}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                      className="min-h-[100px] rounded-xl border-slate-200"
                    />
                  </div>

                  {/* Action Buttons */}
                  {selectedSubmission.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleApprove}
                      >
                        <LuCircleCheck className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={handleRequestRevision}
                      >
                        <LuRotateCcw className="mr-2 h-4 w-4" />
                        Request Revision
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="rounded-2xl border-blue-200/60 bg-white">
              <CardContent className="p-8 text-center">
                <LuFileCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">Select a submission to review</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
