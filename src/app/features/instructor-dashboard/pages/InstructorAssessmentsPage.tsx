import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { LuBookOpenCheck, LuClock3, LuSend, LuTarget } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { supabase } from '../../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../../lib/profileAccess';
import { useInstructorData } from '../hooks/useInstructorData';

type ExerciseLanguage = 'python' | 'javascript';
type ExerciseStatus = 'assigned' | 'submitted' | 'reviewed';

interface HubStudent {
  id: string;
  full_name: string;
  email: string;
}

interface InstructorExercise {
  id: string;
  instructor_id: string;
  student_id: string;
  title: string;
  instructions: string;
  language: ExerciseLanguage;
  starter_code: string;
  due_date: string | null;
  status: ExerciseStatus;
  created_at: string;
  submitted_at: string | null;
  submission_code: string | null;
  submission_output: string | null;
}

interface ExerciseFormState {
  studentId: string;
  title: string;
  instructions: string;
  language: ExerciseLanguage;
  starterCode: string;
  dueDate: string;
}

const DEFAULT_PYTHON_STARTER = '# Complete the exercise here\n\ndef solve():\n    pass\n\nsolve()\n';
const DEFAULT_JAVASCRIPT_STARTER = '// Complete the exercise here\n\nfunction solve() {\n  // your code\n}\n\nsolve();\n';

function getDefaultStarterCode(language: ExerciseLanguage) {
  return language === 'javascript' ? DEFAULT_JAVASCRIPT_STARTER : DEFAULT_PYTHON_STARTER;
}

function isExerciseTableMissing(error: any) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01' || message.includes('instructor_exercises');
}

function normalizeLanguage(value: unknown): ExerciseLanguage {
  return value === 'javascript' ? 'javascript' : 'python';
}

function normalizeStatus(value: unknown): ExerciseStatus {
  if (value === 'submitted' || value === 'reviewed') return value;
  return 'assigned';
}

function normalizeExerciseRow(row: any): InstructorExercise {
  return {
    id: String(row.id),
    instructor_id: String(row.instructor_id),
    student_id: String(row.student_id),
    title: String(row.title || 'Untitled Exercise'),
    instructions: String(row.instructions || ''),
    language: normalizeLanguage(row.language),
    starter_code: String(row.starter_code || ''),
    due_date: row.due_date ? String(row.due_date) : null,
    status: normalizeStatus(row.status),
    created_at: String(row.created_at || ''),
    submitted_at: row.submitted_at ? String(row.submitted_at) : null,
    submission_code: row.submission_code ? String(row.submission_code) : null,
    submission_output: row.submission_output ? String(row.submission_output) : null,
  };
}

export default function InstructorAssessmentsPage() {
  const { instructorHub } = useInstructorData();

  const [hubLocation, setHubLocation] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [students, setStudents] = useState<HubStudent[]>([]);
  const [exercises, setExercises] = useState<InstructorExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSchemaReady, setIsSchemaReady] = useState(true);
  const [schemaMessage, setSchemaMessage] = useState('');

  const [form, setForm] = useState<ExerciseFormState>({
    studentId: '',
    title: '',
    instructions: '',
    language: 'python',
    starterCode: DEFAULT_PYTHON_STARTER,
    dueDate: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadWorkspace = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setInstructorId(user.id);
        }

        const profileRow = await fetchProfileForAuthUser(user as any);
        const metadata = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;
        const currentHub = String(profileRow?.['hub_location'] ?? metadata?.['hub_location'] ?? '');

        if (isMounted) {
          setHubLocation(currentHub);
        }

        const { data: studentRows, error: studentError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'student')
          .eq('hub_location', currentHub)
          .order('full_name', { ascending: true });

        if (!studentError && studentRows && isMounted) {
          const normalizedStudents = studentRows.map((row: any) => ({
            id: String(row.id),
            full_name: String(row.full_name || row.email || 'Student'),
            email: String(row.email || ''),
          }));
          setStudents(normalizedStudents);
          setForm((prev) => ({
            ...prev,
            studentId: prev.studentId || normalizedStudents[0]?.id || '',
          }));
        }

        const { data: exerciseRows, error: exerciseError } = await supabase
          .from('instructor_exercises')
          .select('*')
          .eq('instructor_id', user.id)
          .order('created_at', { ascending: false });

        if (exerciseError) {
          if (isExerciseTableMissing(exerciseError)) {
            if (isMounted) {
              setIsSchemaReady(false);
              setSchemaMessage('Instructor exercise tables are missing. Run supabase/11_instructor_exercises.sql and refresh.');
              setExercises([]);
            }
          } else {
            console.error('Failed to load instructor exercises', exerciseError);
            toast.error('Failed to load instructor exercise queue.');
          }
        } else if (exerciseRows && isMounted) {
          setIsSchemaReady(true);
          setSchemaMessage('');
          setExercises(exerciseRows.map((row: any) => normalizeExerciseRow(row)));
        }
      } catch (error) {
        console.error('Failed to load instructor assessment workspace', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, []);

  const studentNameMap = useMemo(() => {
    return new Map(students.map((student) => [student.id, student.full_name || student.email || 'Student']));
  }, [students]);

  const assignedCount = exercises.filter((exercise) => exercise.status === 'assigned').length;
  const submittedCount = exercises.filter((exercise) => exercise.status === 'submitted').length;
  const reviewedCount = exercises.filter((exercise) => exercise.status === 'reviewed').length;

  const submissionQueue = exercises.filter((exercise) => exercise.status === 'submitted');

  const handleSendExercise = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!instructorId) {
      toast.error('Unable to identify instructor account.');
      return;
    }

    if (!isSchemaReady) {
      toast.error('Database schema not ready. Run supabase/11_instructor_exercises.sql first.');
      return;
    }

    if (!form.studentId) {
      toast.error('Select a student before sending an exercise.');
      return;
    }

    if (!form.title.trim()) {
      toast.error('Exercise title is required.');
      return;
    }

    if (!form.instructions.trim()) {
      toast.error('Exercise instructions are required.');
      return;
    }

    try {
      setIsSending(true);

      const studentIdsToAssign = form.studentId === 'whole-hub'
        ? students.map((s) => s.id)
        : [form.studentId];

      const payloads = studentIdsToAssign.map((studentId) => ({
        instructor_id: instructorId,
        student_id: studentId,
        title: form.title.trim(),
        instructions: form.instructions.trim(),
        language: form.language,
        starter_code: form.starterCode,
        due_date: form.dueDate || null,
      }));

      const { data, error } = await supabase
        .from('instructor_exercises')
        .insert(payloads)
        .select('*');

      if (error) {
        if (isExerciseTableMissing(error)) {
          setIsSchemaReady(false);
          setSchemaMessage('Instructor exercise tables are missing. Run supabase/11_instructor_exercises.sql and refresh.');
          toast.error('Database schema not ready.');
        } else {
          console.error('Failed to send exercise', error);
          toast.error('Failed to send exercise.');
        }
        return;
      }

      if (data) {
        setExercises((prev) => [...data.map(normalizeExerciseRow), ...prev]);
      }

      setForm((prev) => ({
        ...prev,
        title: '',
        instructions: '',
        dueDate: '',
        starterCode: getDefaultStarterCode(prev.language),
      }));

      toast.success('Exercise sent. It is now visible on the student dashboard and sandbox.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkReviewed = async (exerciseId: string) => {
    if (!instructorId) return;

    const { error } = await supabase
      .from('instructor_exercises')
      .update({ status: 'reviewed' })
      .eq('id', exerciseId)
      .eq('instructor_id', instructorId);

    if (error) {
      console.error('Failed to mark exercise reviewed', error);
      toast.error('Failed to mark submission as reviewed.');
      return;
    }

    setExercises((prev) => prev.map((exercise) => (
      exercise.id === exerciseId
        ? { ...exercise, status: 'reviewed' }
        : exercise
    )));

    toast.success('Submission marked as reviewed.');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading assessment workspace...</div>;
  }

  const headingHub = hubLocation || instructorHub?.name || 'Assigned Hub';

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-border bg-primary text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Assessments</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{headingHub} Exercise Workflow</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Send coding exercises to students, track completion in sandbox, and review returned submissions in one place.
          </p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Assigned</p><p className="mt-1 text-base text-white">{assignedCount}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Submitted</p><p className="mt-1 text-base text-white">{submittedCount}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Reviewed</p><p className="mt-1 text-base text-white">{reviewedCount}</p></div>
          </div>
        </CardContent>
      </Card>

      {!isSchemaReady && (
        <Card className="rounded-2xl border-amber-300 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            <p className="font-medium">Schema setup required</p>
            <p className="mt-1">{schemaMessage}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="heading-font text-lg text-foreground">Send Exercise</h2>
              <LuSend className="h-4 w-4 text-muted-foreground" />
            </div>

            <form onSubmit={handleSendExercise} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="exercise-student">Student</Label>
                <select
                  id="exercise-student"
                  value={form.studentId}
                  onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))}
                  className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm text-foreground"
                >
                  <option value="" disabled>Select a student</option>
                  <option value="whole-hub">Whole Hub (All Students)</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exercise-title">Exercise title</Label>
                <Input
                  id="exercise-title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Example: Arrays and loops challenge"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exercise-instructions">Instructions</Label>
                <Textarea
                  id="exercise-instructions"
                  value={form.instructions}
                  onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
                  placeholder="Describe what the student must build or solve."
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="exercise-language">Language</Label>
                  <select
                    id="exercise-language"
                    value={form.language}
                    onChange={(event) => {
                      const nextLanguage = normalizeLanguage(event.target.value);
                      setForm((prev) => ({
                        ...prev,
                        language: nextLanguage,
                        starterCode: getDefaultStarterCode(nextLanguage),
                      }));
                    }}
                    className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm text-foreground"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="exercise-due-date">Due date</Label>
                  <Input
                    id="exercise-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="exercise-starter">Starter code</Label>
                <Textarea
                  id="exercise-starter"
                  value={form.starterCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, starterCode: event.target.value }))}
                  className="min-h-32 font-mono text-xs"
                />
              </div>

              <Button type="submit" disabled={isSending || !students.length} className="w-full">
                {isSending ? 'Sending...' : 'Send Exercise'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="heading-font text-lg text-foreground">Submission Queue</h2>
              <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{submissionQueue.length} pending review</Badge>
            </div>

            <div className="space-y-2">
              {submissionQueue.length === 0 && (
                <div className="rounded-xl border border-dashed border-border bg-sidebar p-4 text-sm text-muted-foreground">
                  No submissions yet. Students will appear here after they submit from sandbox.
                </div>
              )}

              {submissionQueue.map((exercise) => (
                <div key={exercise.id} className="rounded-xl border border-border bg-sidebar p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-foreground">{exercise.title}</p>
                      <p className="text-xs text-muted-foreground">Student: {studentNameMap.get(exercise.student_id) || 'Unknown student'}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {exercise.submitted_at ? new Date(exercise.submitted_at).toLocaleString() : 'Not submitted'}
                      </p>
                    </div>
                    <Button size="sm" className="h-8" onClick={() => handleMarkReviewed(exercise.id)}>
                      Mark reviewed
                    </Button>
                  </div>

                  {exercise.submission_output && (
                    <pre className="mt-2 rounded-lg border border-border bg-card p-2 text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-28 overflow-auto">
                      {exercise.submission_output}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="heading-font text-lg text-foreground">All Sent Exercises</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LuBookOpenCheck className="h-4 w-4" />
              <LuClock3 className="h-4 w-4" />
              <LuTarget className="h-4 w-4" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Exercise</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Language</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {exercises.length > 0 ? exercises.map((exercise) => (
                  <tr key={exercise.id} className="border-t border-border text-sm text-foreground">
                    <td className="px-4 py-3">{exercise.title}</td>
                    <td className="px-4 py-3">{studentNameMap.get(exercise.student_id) || 'Unknown student'}</td>
                    <td className="px-4 py-3 uppercase text-xs">{exercise.language}</td>
                    <td className="px-4 py-3">
                      <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{exercise.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {exercise.due_date ? new Date(exercise.due_date).toLocaleDateString() : 'No due date'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {exercise.submitted_at ? new Date(exercise.submitted_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No exercises sent yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
