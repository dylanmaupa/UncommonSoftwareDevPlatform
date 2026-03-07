import { useEffect, useState, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { LuArrowLeft, LuCheck, LuMessageSquare } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { supabase } from '../../../../lib/supabase';
import { useInstructorData } from '../hooks/useInstructorData';

interface ExerciseDetails {
  id: string;
  title: string;
  instructions: string;
  language: string;
  status: string;
  submitted_at: string | null;
  submission_code: string | null;
  submission_output: string | null;
  instructor_feedback?: string | null;
  grade?: number | null;
  student: {
    full_name: string;
    email: string;
  } | null;
}

export default function InstructorSubmissionReviewPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { instructorStudents } = useInstructorData();
  
  const [exercise, setExercise] = useState<ExerciseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const loadExercise = async () => {
      if (!exerciseId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('instructor_exercises')
          .select(`
            *,
            student:profiles!student_id(full_name, email)
          `)
          .eq('id', exerciseId)
          .single();
          
        if (error) {
          console.error('Failed to load exercise', error);
          toast.error('Could not load submission details');
          if (isMounted) navigate('/instructor/assessments');
          return;
        }
        
        if (isMounted && data) {
          // Flatten student if it comes back as an array
          const studentInfo = Array.isArray(data.student) ? data.student[0] : data.student;
          
          setExercise({
            ...data,
            student: studentInfo || { full_name: 'Unknown Student', email: '' }
          });
          
          if (data.grade !== undefined && data.grade !== null) {
            setGrade(String(data.grade));
          }
          if (data.instructor_feedback) {
            setFeedback(data.instructor_feedback);
          }
        }
      } catch (err) {
        console.error('Unexpected error loading exercise:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadExercise();
    return () => { isMounted = false; };
  }, [exerciseId, navigate]);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!exerciseId || !exercise) return;
    
    const numGrade = grade.trim() ? Number(grade) : null;
    if (grade.trim() && (isNaN(numGrade!) || numGrade! < 0 || numGrade! > 100)) {
      toast.error('Grade must be a number between 0 and 100');
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('instructor_exercises')
        .update({
          status: 'reviewed',
          grade: numGrade,
          instructor_feedback: feedback.trim() || null
        })
        .eq('id', exerciseId);
        
      if (error) {
        console.error('Review save failed:', error);
        toast.error('Failed to save review');
        return;
      }
      
      toast.success('Review saved successfully');
      navigate('/instructor/assessments');
    } catch (err) {
      console.error('Unexpected error saving review:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading submission details...</div>;
  }

  if (!exercise) {
    return <div className="p-8 text-center text-muted-foreground">Submission not found.</div>;
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Link to="/instructor/assessments" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <LuArrowLeft className="h-4 w-4" />
        Back to Assessments
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4">
        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="heading-font text-2xl text-foreground">{exercise.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Student: {exercise.student?.full_name || 'Unknown'} ({exercise.student?.email || 'No email'})
                  </p>
                </div>
                <Badge className={
                  exercise.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' :
                  exercise.status === 'submitted' ? 'bg-blue-500/10 text-blue-700 border-blue-500/30' :
                  'bg-card text-muted-foreground'
                }>
                  {exercise.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6 p-4 rounded-xl bg-sidebar border border-border">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mt-0 mb-2">Instructions</h3>
                <div className="whitespace-pre-wrap">{exercise.instructions}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    {exercise.language === 'essay' ? 'Essay Submission' : 'Code Submission'}
                  </h3>
                  <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                    {exercise.language}
                  </Badge>
                </div>
                
                {exercise.submission_code ? (
                  <pre className="p-4 rounded-xl border border-border bg-black text-white text-sm font-mono overflow-auto max-h-[400px]">
                    {exercise.submission_code}
                  </pre>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed border-border bg-sidebar text-muted-foreground text-sm">
                    No submission provided yet.
                  </div>
                )}
              </div>

              {exercise.language !== 'essay' && exercise.submission_output && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-foreground">Execution Output</h3>
                  <pre className="p-4 rounded-xl border border-border bg-sidebar text-foreground text-sm font-mono overflow-auto max-h-[200px]">
                    {exercise.submission_output}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border sticky top-4">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <LuMessageSquare className="h-4 w-4 text-muted-foreground" />
                <h2 className="heading-font text-lg text-foreground">Grading & Feedback</h2>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="grade">Grade (0-100)</Label>
                  <Input 
                    id="grade"
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="e.g. 95"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="feedback">Instructor Feedback</Label>
                  <Textarea 
                    id="feedback"
                    placeholder="Provide constructive feedback..."
                    className="min-h-32 resize-y"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSaving}>
                  <LuCheck className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Mark as Reviewed'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
