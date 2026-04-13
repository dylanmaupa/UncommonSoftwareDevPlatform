import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useLocation } from 'react-router';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import DashboardLayout from '../layout/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { supabase } from '../../../lib/supabase';
import { loadPyodideEnvironment } from '../../../lib/pyodide';
import { LuTriangle, LuClock, LuDownload, LuFileText, LuPlay, LuSend, LuTerminal, LuTrash2, LuUpload } from 'react-icons/lu';

type ExerciseLanguage = 'python' | 'javascript' | 'document' | 'written';
type ExerciseStatus = 'assigned' | 'submitted' | 'reviewed' | 'approved' | 'rejected';

interface InstructorExerciseAssignment {
  id: string;
  instructor_id: string;
  student_id: string;
  title: string;
  instructions: string;
  language: ExerciseLanguage;
  starter_code: string;
  status: ExerciseStatus;
  due_date: string | null;
  formatting_requirements: string | null;
  submission_code: string | null;
  submission_output: string | null;
  submission_document_path: string | null;
  submission_document_name: string | null;
  submission_document_size: number | null;
  submission_document_mime_type: string | null;
  submitted_at: string | null;
}

const DEFAULT_PYTHON_CODE = '# Try writing some Python code here!\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n';
const DEFAULT_JAVASCRIPT_CODE = '// Try writing some JavaScript code here!\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));\n';

const DOCUMENT_BUCKET = 'assignment-documents';
const DOCUMENT_ACCEPT = '.doc,.docx,.pdf';
const ALLOWED_DOCUMENT_EXTENSIONS = ['doc', 'docx', 'pdf'];

function getDefaultStarterCode(language: ExerciseLanguage) {
  return language === 'javascript' ? DEFAULT_JAVASCRIPT_CODE : DEFAULT_PYTHON_CODE;
}

function normalizeLanguage(value: unknown): ExerciseLanguage {
  if (value === 'javascript') return 'javascript';
  if (value === 'document') return 'document';
  if (value === 'written') return 'written';
  return 'python';
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function getFileExtension(fileName: string) {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? '' : '';
}

function formatBytes(bytes: number | null) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function createDocumentUrl(path: string) {
  const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

function getDocumentStorageErrorMessage(error: unknown) {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : '';

  if (message.toLowerCase().includes('bucket not found')) {
    return 'Document uploads are not configured in Supabase yet. Run the document assignment SQL migration to create the assignment-documents bucket.';
  }

  return 'Failed to upload your document.';
}

export default function Sandbox() {
  const location = useLocation();
  const exerciseId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('exerciseId')?.trim() ?? '';
  }, [location.search]);

  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<ExerciseLanguage>('python');
  const [assignment, setAssignment] = useState<InstructorExerciseAssignment | null>(null);
  const [assignmentError, setAssignmentError] = useState('');
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isResolvingDocumentUrl, setIsResolvingDocumentUrl] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const isWrittenAssignment = language === 'written';
  const wordCount = code.trim() ? code.trim().split(/\s+/).length : 0;

  // Auto-save logic for written assignments
  useEffect(() => {
    if (!isWrittenAssignment || !assignment || assignment.status === 'submitted' || assignment.status === 'approved' || !currentUserId) return;
    
    // Don't auto-save if the code hasn't changed from the initial submission or starter code
    if (code === (assignment.submission_code || assignment.starter_code)) return;

    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await supabase
          .from('instructor_exercises')
          .update({ submission_code: code })
          .eq('id', assignment.id)
          .eq('student_id', currentUserId);
      } catch (err) {
        console.error('Auto-save failed', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [code, isWrittenAssignment, assignment, currentUserId]);

  const logActivity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: activityError } = await supabase.rpc('record_user_activity', { p_user_id: user.id });
      if (activityError) {
        console.error("Error recording user activity via RPC:", activityError);
        // Fallback
        const { data: profile } = await supabase.from('profiles').select('streak, longest_streak, last_activity_date, broken_streaks').eq('id', user.id).single();
        if (profile) {
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const lastActive = profile.last_activity_date;
          if (lastActive !== today) {
            let newStreak = profile.streak || 0;
            let brokenStreaks = profile.broken_streaks || 0;

            if (lastActive && lastActive < yesterday && newStreak > 0) {
              brokenStreaks += 1;
            }

            if (lastActive === yesterday) {
              newStreak += 1;
            } else {
              newStreak = 1;
            }
            const newLongest = Math.max(profile.longest_streak || 0, newStreak);
            await supabase.from('profiles').update({
              streak: newStreak,
              longest_streak: newLongest,
              last_activity_date: today,
              broken_streaks: brokenStreaks
            }).eq('id', user.id);
          }
        }
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const resolveCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) {
        setCurrentUserId(user?.id ?? null);
      }
    };

    resolveCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAssignment = async () => {
      if (!exerciseId) {
        if (!isMounted) return;
        setAssignment(null);
        setAssignmentError('');
        setSelectedDocument(null);
        setDocumentUrl(null);
        return;
      }

      setIsLoadingAssignment(true);
      setAssignmentError('');
      setSelectedDocument(null);
      setDocumentUrl(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (!user) {
        setAssignmentError('Sign in to load this exercise.');
        setIsLoadingAssignment(false);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('instructor_exercises')
        .select('*')
        .eq('id', exerciseId)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        if (error.code === '42P01') {
          setAssignmentError('Instructor exercise tables are not set up yet. Run the latest SQL migration first.');
        } else {
          console.error('Failed to load exercise assignment', error);
          setAssignmentError('Failed to load this exercise assignment.');
        }
        setIsLoadingAssignment(false);
        return;
      }

      if (!data) {
        setAssignmentError('This exercise assignment was not found.');
        setIsLoadingAssignment(false);
        return;
      }

      const normalized: InstructorExerciseAssignment = {
        id: String(data.id),
        instructor_id: String(data.instructor_id),
        student_id: String(data.student_id),
        title: String(data.title || 'Untitled Exercise'),
        instructions: String(data.instructions || ''),
        language: normalizeLanguage(data.language),
        starter_code: String(data.starter_code || ''),
        status: ['submitted', 'reviewed', 'approved', 'rejected'].includes(String(data.status)) ? data.status : 'assigned',
        due_date: data.due_date ? String(data.due_date) : null,
        formatting_requirements: data.formatting_requirements ? String(data.formatting_requirements) : null,
        submission_code: data.submission_code ? String(data.submission_code) : null,
        submission_output: data.submission_output ? String(data.submission_output) : null,
        submission_document_path: data.submission_document_path ? String(data.submission_document_path) : null,
        submission_document_name: data.submission_document_name ? String(data.submission_document_name) : null,
        submission_document_size: typeof data.submission_document_size === 'number' ? data.submission_document_size : null,
        submission_document_mime_type: data.submission_document_mime_type ? String(data.submission_document_mime_type) : null,
        submitted_at: data.submitted_at ? String(data.submitted_at) : null,
      };

      if (normalized.student_id !== user.id && normalized.instructor_id !== user.id) {
        setAssignmentError('You do not have permission to view this exercise.');
        setIsLoadingAssignment(false);
        return;
      }

      setAssignment(normalized);
      setLanguage(normalized.language);

      const initialCode = normalized.submission_code || normalized.starter_code || getDefaultStarterCode(normalized.language);
      setCode(initialCode);
      setOutput(normalized.submission_output || '');
      if (normalized.submission_document_path) {
        setIsResolvingDocumentUrl(true);
        try {
          const signedUrl = await createDocumentUrl(normalized.submission_document_path);
          if (isMounted) {
            setDocumentUrl(signedUrl);
          }
        } catch (documentError) {
          console.error('Failed to create signed URL for assignment document', documentError);
        } finally {
          if (isMounted) {
            setIsResolvingDocumentUrl(false);
          }
        }
      }
      setIsLoadingAssignment(false);
    };

    loadAssignment();

    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  const executeCode = async (sourceCode: string) => {
    if (language === 'python') {
      try {
        const pyodide = await loadPyodideEnvironment();

        // Redirect stdout/stderr specifically for this run
        await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

        try {
          await pyodide.runPythonAsync(sourceCode);
          const stdout = await pyodide.runPythonAsync('sys.stdout.getvalue()');
          const stderr = await pyodide.runPythonAsync('sys.stderr.getvalue()');
          return { run: { output: stdout || stderr, code: stderr ? 1 : 0, stderr } };
        } catch (execErr: any) {
          return { run: { output: String(execErr), code: 1, stderr: String(execErr) } };
        }
      } catch (err: any) {
        console.error('Pyodide Error:', err);
        return { run: { output: 'Failed to load Python environment: \n' + String(err), code: 1, stderr: 'Error' } };
      }
    }

    // JavaScript Sandbox
    let stdout = '';
    const originalLog = console.log;
    console.log = (...args) => {
      stdout += args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
    };

    try {
      const func = new Function(sourceCode);
      func();
      return { run: { output: stdout, code: 0, stderr: '' } };
    } catch (err: any) {
      return { run: { output: stdout + '\n' + String(err), code: 1, stderr: String(err) } };
    } finally {
      console.log = originalLog;
    }
  };

  const handleRun = async () => {
    if (language === 'javascript') {
      toast.info('JavaScript sandbox is coming soon.');
      return;
    }
    if (language === 'document') {
      toast.info('Document assignments do not run in the code sandbox.');
      return;
    }

    try {
      setIsRunning(true);
      if (language === 'python' && !window.pyodideLocal) {
        setOutput('Connecting to Python environment...\n');
      } else {
        setOutput('Running code...\n');
      }

      const result = await executeCode(code);
      setOutput(result?.run?.output || 'No output.');
    } catch (e: any) {
      setOutput(`Execution failed: ${e?.message || String(e)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDocumentSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) {
      setSelectedDocument(null);
      return;
    }

    const extension = getFileExtension(nextFile.name);
    if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(extension)) {
      event.target.value = '';
      setSelectedDocument(null);
      toast.error('Only .doc, .docx, and .pdf files are allowed.');
      return;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      event.target.value = '';
      setSelectedDocument(null);
      toast.error('Please upload a file smaller than 10MB.');
      return;
    }

    setSelectedDocument(nextFile);
  };

  const openDocument = async () => {
    if (!assignment?.submission_document_path) {
      toast.error('No uploaded document found for this assignment.');
      return;
    }

    try {
      let nextUrl = documentUrl;
      if (!nextUrl) {
        setIsResolvingDocumentUrl(true);
        nextUrl = await createDocumentUrl(assignment.submission_document_path);
        setDocumentUrl(nextUrl);
      }
      window.open(nextUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open document', error);
      toast.error('Failed to open the uploaded document.');
    } finally {
      setIsResolvingDocumentUrl(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!assignment || !currentUserId) {
      toast.error('Assignment context is missing.');
      return;
    }

    if (assignment.student_id !== currentUserId) {
      toast.error('Only the assigned student can submit this exercise.');
      return;
    }

    if (assignment.status === 'reviewed' || assignment.status === 'approved') {
      toast.error('This exercise has already been finalized by your instructor.');
      return;
    }

    try {
      setIsSubmittingAssignment(true);

      if (assignment.language === 'document') {
        if (!selectedDocument && !assignment.submission_document_path) {
          toast.error('Choose a document before submitting.');
          return;
        }

        let nextDocumentPath = assignment.submission_document_path;
        let nextDocumentName = assignment.submission_document_name;
        let nextDocumentSize = assignment.submission_document_size;
        let nextDocumentMimeType = assignment.submission_document_mime_type;

        if (selectedDocument) {
          const uploadPath = `${currentUserId}/${assignment.id}/${Date.now()}-${sanitizeFileName(selectedDocument.name)}`;
          const { error: uploadError } = await supabase.storage
            .from(DOCUMENT_BUCKET)
            .upload(uploadPath, selectedDocument, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Failed to upload document', uploadError);
            toast.error(getDocumentStorageErrorMessage(uploadError));
            return;
          }

          nextDocumentPath = uploadPath;
          nextDocumentName = selectedDocument.name;
          nextDocumentSize = selectedDocument.size;
          nextDocumentMimeType = selectedDocument.type || null;
        }

        const payload = {
          submission_document_path: nextDocumentPath,
          submission_document_name: nextDocumentName,
          submission_document_size: nextDocumentSize,
          submission_document_mime_type: nextDocumentMimeType,
          submission_code: null,
          submission_output: nextDocumentName ? `Uploaded document: ${nextDocumentName}` : 'Uploaded document submission.',
          submitted_at: new Date().toISOString(),
          status: 'submitted' as ExerciseStatus,
        };

        const { error } = await supabase
          .from('instructor_exercises')
          .update(payload)
          .eq('id', assignment.id)
          .eq('student_id', currentUserId);

        if (error) {
          console.error('Failed to submit document assignment', error);
          toast.error('Failed to send your document to the instructor.');
          return;
        }

        let nextDocumentUrl = documentUrl;
        if (payload.submission_document_path) {
          try {
            nextDocumentUrl = await createDocumentUrl(payload.submission_document_path);
          } catch (documentError) {
            console.error('Failed to create signed URL for uploaded document', documentError);
          }
        }

        setAssignment((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...payload,
          };
        });
        setDocumentUrl(nextDocumentUrl);
        setSelectedDocument(null);
        await logActivity();
        toast.success('Document submitted to your instructor.');
        return;
      }

      if (language === 'javascript') {
        toast.info('JavaScript sandbox is coming soon.');
        return;
      }

      setIsRunning(true);

      if (language === 'python' && !window.pyodideLocal) {
        setOutput('Running and preparing your submission...\n');
      } else {
        setOutput('Running and preparing your submission...\n');
      }

      const result = await executeCode(code);
      const submissionOutput = result?.run?.output || 'No output.';
      setOutput(submissionOutput);

      const payload = {
        submission_code: code,
        submission_output: submissionOutput,
        submitted_at: new Date().toISOString(),
        status: 'submitted' as ExerciseStatus,
      };

      const { error } = await supabase
        .from('instructor_exercises')
        .update(payload)
        .eq('id', assignment.id)
        .eq('student_id', currentUserId);

      if (error) {
        if (error.code === '42P01') {
          toast.error('Instructor exercise tables are not set up yet. Run the latest SQL migration first.');
        } else {
          console.error('Failed to submit assignment', error);
          toast.error('Failed to send your submission to the instructor.');
        }
        return;
      }

      setAssignment((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          submission_code: payload.submission_code,
          submission_output: payload.submission_output,
          submitted_at: payload.submitted_at,
          status: payload.status,
        };
      });

      await logActivity();
      toast.success('Exercise submitted to your instructor.');
    } catch (error) {
      console.error('Submission error', error);
      toast.error(
        assignment?.language === 'document'
          ? getDocumentStorageErrorMessage(error)
          : 'Failed to submit exercise.'
      );
    } finally {
      setIsSubmittingAssignment(false);
      setIsRunning(false);
    }
  };

  const handleClearConsole = () => {
    setOutput('');
  };

  const isAssignmentMode = Boolean(assignment || exerciseId);
  const isLanguageLocked = Boolean(assignment);
  const isDocumentAssignment = language === 'document';
  const isJavaScriptBlocked = language === 'javascript';
  const canSubmitAssignment = Boolean(
    assignment &&
    currentUserId &&
    assignment.student_id === currentUserId &&
    assignment.status !== 'reviewed' &&
    assignment.status !== 'approved'
  );

  return (
    <DashboardLayout>
      <div className="relative flex flex-col min-h-[calc(100vh-theme(spacing.16))] lg:min-h-screen bg-[#0b0b0b] text-white overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.1),_transparent_40%)]"
        />
        <div className="relative z-10 flex flex-col min-h-[calc(100vh-theme(spacing.16))] lg:min-h-screen">
          <div className="border-b border-white/10 bg-[#0f0f10]/90 backdrop-blur px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30">
                {isDocumentAssignment ? <LuFileText className="h-5 w-5" /> : <LuTerminal className="h-5 w-5" />}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white heading-font">{isDocumentAssignment ? 'Assignment Workspace' : 'Practice Sandbox'}</h1>
                <p className="text-xs text-white/60">
                  {isDocumentAssignment
                    ? 'Upload your completed document and submit it to your instructor.'
                    : isAssignmentMode
                      ? 'Complete your assigned exercise and submit it to your instructor.'
                      : 'Write and test your code securely in the browser.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isDocumentAssignment && !isWrittenAssignment && (
                <>
                  <select
                    className="bg-[#111214] border border-white/10 rounded-lg text-sm px-3 py-2 text-white/80 outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                    value={language}
                    disabled={isLanguageLocked || isJavaScriptBlocked}
                    onChange={(e) => {
                      const nextLanguage = normalizeLanguage(e.target.value);
                      if (nextLanguage === 'javascript') {
                        toast.info('JavaScript sandbox is coming soon.');
                        return;
                      }

                      setLanguage(nextLanguage);
                      if (nextLanguage === 'python' && code.includes('function greet(name)')) {
                        setCode(DEFAULT_PYTHON_CODE);
                      }
                    }}
                  >
                    <option value="python">Python</option>
                    <option value="javascript" disabled>JavaScript (Coming soon)</option>
                  </select>
                  <Button
                    onClick={handleRun}
                    disabled={isRunning || isJavaScriptBlocked}
                    className="bg-blue-500 text-white hover:bg-blue-400 rounded-full px-6 shadow-lg shadow-blue-500/20"
                  >
                    <LuPlay className="w-4 h-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                </>
              )}
              {isAssignmentMode && (
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={isRunning || isSubmittingAssignment || !canSubmitAssignment || isJavaScriptBlocked || (isWrittenAssignment && !code.trim())}
                  className="bg-emerald-500 text-white hover:bg-emerald-400 rounded-full px-6 shadow-lg shadow-emerald-500/20"
                >
                  <LuSend className="w-4 h-4 mr-2" />
                  {isSubmittingAssignment ? 'Submitting...' : assignment?.status === 'submitted' ? 'Resubmit' : 'Submit to Instructor'}
                </Button>
              )}
            </div>
          </div>

          {isAssignmentMode && (
            <div className="px-4 pt-4 lg:px-6 lg:pt-6">
              <Card className="border border-white/10 bg-[#111214] rounded-2xl">
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/50">Assigned Exercise</p>
                      <h2 className="mt-1 text-base text-white">
                        {isLoadingAssignment ? 'Loading exercise...' : assignment?.title || 'Exercise unavailable'}
                      </h2>
                    </div>
                    {assignment && (
                      <div className="flex items-center gap-2">
                        <Badge className="border border-white/20 bg-white/10 text-white text-[11px]">
                          {assignment.language === 'document' ? 'document upload' : assignment.language}
                        </Badge>
                        <Badge className="border border-white/20 bg-white/10 text-white text-[11px]">
                          {assignment.status}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {assignmentError ? (
                    <p className="text-sm text-red-300">{assignmentError}</p>
                  ) : (
                    <>
                      <p className="text-sm text-white/75 whitespace-pre-wrap">
                        {assignment?.instructions || 'Open the editor below and complete the assigned task.'}
                      </p>
                      {assignment?.formatting_requirements && (
                        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-3 text-sm text-blue-100">
                          <p className="text-xs uppercase tracking-[0.18em] text-blue-200/70">Formatting Requirements</p>
                          <p className="mt-2 whitespace-pre-wrap">{assignment.formatting_requirements}</p>
                        </div>
                      )}

                      {(() => {
                        const isLate = assignment?.due_date && (
                          assignment.status === 'assigned'
                            ? new Date() > new Date(assignment.due_date)
                            : (assignment.submitted_at && new Date(assignment.submitted_at) > new Date(assignment.due_date))
                        );

                        return (
                          <div className="flex gap-4">
                            <p className={`text-xs ${isLate ? 'text-red-400 font-medium' : 'text-white/50'}`}>
                              {assignment?.due_date ? `Due date: ${new Date(assignment.due_date).toLocaleDateString()}` : 'No due date set.'}
                              {isLate && ' (Late)'}
                            </p>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col lg:flex-row gap-6">
            {isDocumentAssignment ? (
              <>
                <Card className="flex-1 border border-white/10 rounded-2xl bg-[#141518] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-36px_rgba(0,0,0,0.9)]">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Upload submission</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">Research document</h3>
                      <p className="mt-2 text-sm text-white/65">
                        Upload a `.doc`, `.docx`, or `.pdf` file. The latest upload will be the version your instructor reviews.
                      </p>
                    </div>

                    <label className="block rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center cursor-pointer hover:border-blue-400/40 hover:bg-blue-500/[0.04] transition-colors">
                      <input
                        type="file"
                        accept={DOCUMENT_ACCEPT}
                        className="hidden"
                        onChange={handleDocumentSelected}
                        disabled={!canSubmitAssignment}
                      />
                      <LuUpload className="mx-auto h-8 w-8 text-blue-300" />
                      <p className="mt-3 text-sm font-medium text-white">
                        {selectedDocument ? selectedDocument.name : 'Choose a document to upload'}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        Max 10MB. Accepted formats: `.doc`, `.docx`, `.pdf`
                      </p>
                    </label>

                    {selectedDocument && (
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <p className="text-sm font-medium text-emerald-100">{selectedDocument.name}</p>
                        <p className="mt-1 text-xs text-emerald-200/80">{formatBytes(selectedDocument.size)} ready to submit</p>
                      </div>
                    )}

                    {assignment?.submission_document_name && (
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Current submission</p>
                        <p className="mt-2 text-sm font-medium text-white">{assignment.submission_document_name}</p>
                        <p className="mt-1 text-xs text-white/45">
                          {formatBytes(assignment.submission_document_size)}
                          {assignment.submitted_at ? ` • Submitted ${new Date(assignment.submitted_at).toLocaleString()}` : ''}
                        </p>
                        <div className="mt-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                            onClick={openDocument}
                            disabled={isResolvingDocumentUrl}
                          >
                            <LuDownload className="mr-2 h-4 w-4" />
                            {isResolvingDocumentUrl ? 'Preparing file...' : 'Open uploaded document'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:w-1/3 border border-white/10 rounded-2xl bg-[#0f1012] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-36px_rgba(0,0,0,0.9)]">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Submission notes</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">Before you submit</h3>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                      Make sure your document follows the instructor&apos;s formatting rules and includes your final content before submitting.
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                      Re-uploading a new file and clicking submit again will replace the current version your instructor sees.
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                      Status:
                      <span className="ml-2 font-medium text-white">{assignment?.status || 'draft'}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : isWrittenAssignment ? (
              <div className="flex-1 flex flex-col gap-6 w-full max-w-4xl mx-auto">
                <Card className="border border-white/10 rounded-2xl bg-[#141518] shadow-xl overflow-hidden">
                  <div className="bg-[#1a1b1e] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400">
                      <LuFileText className="w-5 h-5" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Theory Question</span>
                    </div>
                    {isAutoSaving && (
                      <div className="flex items-center gap-2 text-white/40 text-xs animate-pulse">
                        <LuClock className="w-3 h-3" />
                        Saving locally...
                      </div>
                    )}
                  </div>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <LuTriangle className="w-5 h-5 text-amber-500" />
                          Question
                        </h3>
                        <p className="text-white/80 leading-relaxed text-lg">
                          {assignment?.instructions || 'Please provide your written answer below.'}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-sm font-medium text-white/60">Your Answer</label>
                          <span className={`text-xs font-mono ${wordCount > 500 ? 'text-amber-400' : 'text-white/40'}`}>
                            {wordCount} words
                          </span>
                        </div>
                        <textarea
                          className="w-full min-h-[400px] bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-sans text-lg leading-relaxed resize-none disabled:opacity-50"
                          placeholder="Type your answer here..."
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            toast.error("Pasting is not allowed. Please type your answer.");
                          }}
                          onCopy={(e) => {
                            e.preventDefault();
                            toast.info("Copying is disabled for this assignment.");
                          }}
                          onCut={(e) => {
                            e.preventDefault();
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          disabled={!canSubmitAssignment}
                        />
                        <div className="flex items-center gap-2 px-1">
                          <div className={`w-2 h-2 rounded-full ${code.trim() ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <p className="text-[11px] text-white/40 uppercase tracking-wider">
                            {code.trim() ? 'Answer present' : 'Answer required for submission'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                <Card className="flex-1 flex flex-col gap-0 border border-white/10 overflow-hidden rounded-2xl min-h-[420px] bg-[#141518] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-36px_rgba(0,0,0,0.9)]">
                  <div className="flex-1 bg-[#141518] relative">
                    <Editor
                      height="100%"
                      language={language}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-dark"
                      onMount={(editor, monaco) => {
                        // Add resize listener
                        const updateHeight = () => {
                          const container = document.getElementById('editor-container');
                          if (container) {
                            const height = container.clientHeight;
                            editor.layout({ width: container.clientWidth, height });
                          }
                        };
                        window.addEventListener('resize', updateHeight);

                        // Add a keyboard listener to block Ctrl+V paste in the code editor
                        if (!isJavaScriptBlocked) {
                          editor.onKeyDown((e: any) => {
                            if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV) {
                              e.preventDefault();
                              e.stopPropagation();
                              toast.warning("Pasting is disabled! Typing it out helps you learn.");
                            }
                          });
                          
                          // Prevent native right-click paste
                          const domNode = editor.getDomNode();
                          if (domNode) {
                            domNode.addEventListener('paste', (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toast.warning("Pasting is disabled! Typing it out helps you learn.");
                            }, true);
                          }
                        }

                        // Also block the onDidPaste event if somehow it gets triggered
                        editor.onDidPaste(() => {
                          const model = editor.getModel();
                          if (model && !isJavaScriptBlocked) {
                            const selection = editor.getSelection();
                            if (selection) {
                              const range = selection;
                              const currentValue = model.getValueInRange(range);
                              if (currentValue) {
                                editor.executeEdits('paste-blocker', [
                                  {
                                    range: range,
                                    text: '',
                                    forceMoveMarkers: true
                                  }
                                ]);
                              }
                            }
                          }
                          if (!isJavaScriptBlocked) {
                            toast.warning("Pasting is disabled! Typing it out helps you learn.");
                          }
                        });
                        
                        // Also disable paste command
                        editor.addCommand(
                          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV,
                          () => null
                        );
                        editor.addCommand(
                          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyV,
                          () => null
                        );
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: language === 'python' ? 4 : 2,
                        readOnly: isJavaScriptBlocked,
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                      }}
                      className="absolute inset-0"
                    />
                  </div>
                </Card>

                <Card className="lg:w-1/3 flex flex-col gap-0 border border-white/10 overflow-hidden rounded-2xl min-h-[300px] lg:min-h-0 bg-[#0f1012] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-36px_rgba(0,0,0,0.9)]">
                  <div className="bg-[#17181b] px-4 py-2 flex items-center justify-between border-b border-[#24262b]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-2">
                      <LuTerminal className="w-3 h-3" /> Console
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearConsole}
                      className="h-7 text-xs text-white/50 hover:text-white hover:bg-white/10"
                    >
                      <LuTrash2 className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto w-full">
                    {output ? (
                      <pre className="text-sm font-mono text-blue-400 whitespace-pre-wrap leading-relaxed">
                        {output}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/30 text-sm italic font-mono">
                        Output will appear here...
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {isJavaScriptBlocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-sm">
            <div className="rounded-2xl border border-white/20 bg-black/70 px-6 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Coming soon</p>
              <p className="mt-2 text-sm font-medium text-white">JavaScript sandbox is temporarily unavailable.</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}









