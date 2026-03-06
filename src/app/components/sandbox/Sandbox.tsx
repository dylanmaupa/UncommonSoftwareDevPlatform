import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import DashboardLayout from '../layout/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { supabase } from '../../../lib/supabase';
import { loadPyodideEnvironment } from '../../../lib/pyodide';
import { LuPlay, LuSend, LuTerminal, LuTrash2 } from 'react-icons/lu';

type ExerciseStatus = 'assigned' | 'submitted' | 'reviewed';

interface InstructorExerciseAssignment {
  id: string;
  instructor_id: string;
  student_id: string;
  title: string;
  instructions: string;
  language: 'python' | 'javascript';
  starter_code: string;
  status: ExerciseStatus;
  due_date: string | null;
  submission_code: string | null;
  submission_output: string | null;
  submitted_at: string | null;
}

const DEFAULT_PYTHON_CODE = '# Try writing some Python code here!\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n';
const DEFAULT_JAVASCRIPT_CODE = '// Try writing some JavaScript code here!\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));\n';

function getDefaultStarterCode(language: 'python' | 'javascript') {
  return language === 'javascript' ? DEFAULT_JAVASCRIPT_CODE : DEFAULT_PYTHON_CODE;
}

function normalizeLanguage(value: unknown): 'python' | 'javascript' {
  return value === 'javascript' ? 'javascript' : 'python';
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
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [assignment, setAssignment] = useState<InstructorExerciseAssignment | null>(null);
  const [assignmentError, setAssignmentError] = useState('');
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const logActivity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.rpc('record_user_activity', { p_user_id: user.id });
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
        return;
      }

      setIsLoadingAssignment(true);
      setAssignmentError('');

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
        status: data.status === 'submitted' || data.status === 'reviewed' ? data.status : 'assigned',
        due_date: data.due_date ? String(data.due_date) : null,
        submission_code: data.submission_code ? String(data.submission_code) : null,
        submission_output: data.submission_output ? String(data.submission_output) : null,
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

    try {
      setIsRunning(true);
      if (language === 'python' && !window.pyodideLocal) {
        setOutput('Connecting to Python environment...\n');
      } else {
        setOutput('Running code...\n');
      }

      const result = await executeCode(code);
      setOutput(result?.run?.output || 'No output.');

      // Log activity for streaks on successful run attempt
      await logActivity();
    } catch (e: any) {
      setOutput(`Execution failed: ${e?.message || String(e)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (language === 'javascript') {
      toast.info('JavaScript sandbox is coming soon.');
      return;
    }
    if (!assignment || !currentUserId) {
      toast.error('Assignment context is missing.');
      return;
    }

    if (assignment.student_id !== currentUserId) {
      toast.error('Only the assigned student can submit this exercise.');
      return;
    }

    if (assignment.status === 'reviewed') {
      toast.error('This exercise has already been reviewed by your instructor.');
      return;
    }

    try {
      setIsSubmittingAssignment(true);
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
      toast.error('Failed to submit exercise.');
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
  const isJavaScriptBlocked = language === 'javascript';
  const canSubmitAssignment = Boolean(
    assignment &&
    currentUserId &&
    assignment.student_id === currentUserId &&
    assignment.status !== 'reviewed'
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
                <LuTerminal className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white heading-font">Practice Sandbox</h1>
                <p className="text-xs text-white/60">
                  {isAssignmentMode ? 'Complete your assigned exercise and submit it to your instructor.' : 'Write and test your code securely in the browser.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              {isAssignmentMode && (
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={isRunning || isSubmittingAssignment || !canSubmitAssignment || isJavaScriptBlocked}
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
                      <Badge className="border border-white/20 bg-white/10 text-white text-[11px]">
                        {assignment.status}
                      </Badge>
                    )}
                  </div>

                  {assignmentError ? (
                    <p className="text-sm text-red-300">{assignmentError}</p>
                  ) : (
                    <>
                      <p className="text-sm text-white/75 whitespace-pre-wrap">
                        {assignment?.instructions || 'Open the editor below and complete the assigned task.'}
                      </p>
                      <p className="text-xs text-white/50">
                        {assignment?.due_date ? `Due date: ${new Date(assignment.due_date).toLocaleDateString()}` : 'No due date set.'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col lg:flex-row gap-6">

            {/* Editor Column */}
            <Card className="flex-1 flex flex-col gap-0 border border-white/10 overflow-hidden rounded-2xl min-h-[420px] bg-[#141518] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-36px_rgba(0,0,0,0.9)]">
              <div className="bg-[#17181b] p-2 border-b border-[#24262b] flex items-center justify-between">
                <div className="flex gap-2 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-500/80"></div>
                </div>
                <span className="text-xs text-white/50 font-mono tracking-wider">{language === 'python' ? 'main.py' : 'index.js'}</span>
                <div className="w-10"></div>
              </div>
              <div className="flex-1 bg-[#141518] relative">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
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

            {/* Console Column */}
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









