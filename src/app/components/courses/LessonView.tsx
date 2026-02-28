import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import DashboardLayout from '../layout/DashboardLayout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  LuArrowLeft,
  LuCircleCheck,
  LuChevronRight,
  LuEye,
  LuEyeOff,
  LuLightbulb,
  LuPlay,
  LuTrophy,
  LuZap,
} from 'react-icons/lu';
import { supabase } from '../../../lib/supabase';
import { loadPyodideEnvironment } from '../../../lib/pyodide';

export default function LessonView() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [module, setModule] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [solutionUsed, setSolutionUsed] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return navigate('/');
        setUser(currentUser);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileData) {
          setUserProfile(profileData);
        }

        const { data: cData } = await supabase
          .from('courses')
          .select(`
            *,
            modules (
              *,
              lessons (*)
            )
          `)
          .eq('id', courseId)
          .single();

        if (cData) {
          cData.modules.sort((a: any, b: any) => a.order - b.order);
          cData.modules.forEach((m: any) => {
            if (m.lessons) {
              m.lessons.sort((a: any, b: any) => a.order - b.order);
            } else {
              m.lessons = [];
            }
          });
          setCourse(cData);

          const foundModule = cData.modules.find((m: any) => m.id === moduleId);
          setModule(foundModule);

          if (foundModule) {
            const foundLesson = foundModule.lessons.find((l: any) => l.id === lessonId);
            setLesson(foundLesson);
            if (foundLesson) {
              setCode(foundLesson.starter_code || '');
            }
          }
        }

        const { data: pData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', currentUser.id);

        if (pData) {
          setUserProgress(pData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (courseId && moduleId && lessonId) {
      loadData();
    }
  }, [courseId, moduleId, lessonId, navigate]);

  useEffect(() => {
    if (lesson) {
      setCode(lesson.starter_code || '');
      setOutput('');
      setShowHint(false);
      setShowSolution(false);
      setHintUsed(false);
      setSolutionUsed(false);
    }
  }, [lessonId, lesson]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading lesson...</div>
      </DashboardLayout>
    );
  }

  if (!lesson || !module || !course) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Lesson not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const isCompleted = userProgress.some(p => p.item_id === lesson.id && p.item_type === 'lesson' && p.status === 'completed');

  let nextLesson: { courseId: string; moduleId: string; lessonId: string } | null = null;
  if (course && module && lesson) {
    const currentLessonIndex = module.lessons.findIndex((l: any) => l.id === lesson.id);
    if (currentLessonIndex < module.lessons.length - 1) {
      nextLesson = {
        courseId: course.id,
        moduleId: module.id,
        lessonId: module.lessons[currentLessonIndex + 1].id,
      };
    } else {
      const currentModuleIndex = course.modules.findIndex((m: any) => m.id === module.id);
      if (currentModuleIndex < course.modules.length - 1) {
        const nextMod = course.modules[currentModuleIndex + 1];
        if (nextMod.lessons.length > 0) {
          nextLesson = {
            courseId: course.id,
            moduleId: nextMod.id,
            lessonId: nextMod.lessons[0].id,
          };
        }
      }
    }
  }

  const executeCode = async (sourceCode: string) => {
    const lang = lesson.language || 'javascript';

    if (lang === 'python') {
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
          const stdout = await pyodide.runPythonAsync("sys.stdout.getvalue()");
          const stderr = await pyodide.runPythonAsync("sys.stderr.getvalue()");
          return { run: { output: stdout || stderr, code: stderr ? 1 : 0, stderr } };
        } catch (execErr: any) {
          return { run: { output: String(execErr), code: 1, stderr: String(execErr) } };
        }
      } catch (err: any) {
        console.error('Pyodide Error:', err);
        return { run: { output: 'Failed to load Python environment: \n' + String(err), code: 1, stderr: 'Error' } };
      }
    } else {
      // JavaScript
      let stdout = '';
      const originalLog = console.log;
      console.log = (...args) => {
        stdout += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
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
    }
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const lang = lesson?.language || 'javascript';
      if (lang === 'python' && !window.pyodideLocal) {
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

  const handleSubmit = async () => {
    try {
      setIsRunning(true);
      const lang = lesson?.language || 'javascript';
      if (lang === 'python' && !window.pyodideLocal) {
        setOutput('Connecting to Python environment...\n');
      } else {
        setOutput('Running test cases...\n');
      }

      const result = await executeCode(code);
      const executionOutput = result?.run?.output || '';
      const exitCode = result?.run?.code || 0;
      const stderr = result?.run?.stderr || '';

      setOutput(executionOutput);

      let isCorrect = exitCode === 0 && !stderr && executionOutput.trim().length > 0;

      // Verify against solution output if a solution exists
      if (isCorrect && lesson.exercise_solution) {
        setOutput((prev) => prev + '\nVerifying against solution...\n');
        const solutionResult = await executeCode(lesson.exercise_solution);
        const solutionOutput = solutionResult?.run?.output || '';

        if (executionOutput.trim() !== solutionOutput.trim()) {
          isCorrect = false;
          setOutput((prev) => prev + `\nVerification failed.\nExpected Output:\n${solutionOutput.trim()}\n\nYour Output:\n${executionOutput.trim()}`);
        } else {
          setOutput((prev) => prev + '\nOutput matches solution perfectly!\n');
        }
      }

      if (isCorrect && user) {
        try {
          // Log activity for streaks on successful completion ALWAYS
          await supabase.rpc('record_user_activity', { p_user_id: user.id });

          if (!isCompleted) {
            // Upsert lesson progress
            const lessonProgressEntry = {
              user_id: user.id,
              item_id: lesson.id,
              item_type: 'lesson',
              status: 'completed',
              progress_percentage: 100,
              updated_at: new Date().toISOString()
            };

            await supabase.from('user_progress').upsert(lessonProgressEntry, { onConflict: 'user_id, item_id, item_type' });

            // Calculate and update module progress
            const updatedProgress = [...userProgress, lessonProgressEntry];
            const completedInModule = module.lessons.filter((l: any) =>
              updatedProgress.some(p => p.item_id === l.id && p.item_type === 'lesson' && p.status === 'completed')
            ).length;
            const moduleProgressObj = {
              user_id: user.id,
              item_id: module.id,
              item_type: 'module',
              status: completedInModule === module.lessons.length ? 'completed' : 'in_progress',
              progress_percentage: Math.round((completedInModule / (module.lessons.length || 1)) * 100),
              updated_at: new Date().toISOString()
            };
            await supabase.from('user_progress').upsert(moduleProgressObj, { onConflict: 'user_id, item_id, item_type' });

            // Calculate and update course progress
            const totalLessons = course.modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0);
            const completedInCourse = course.modules.reduce((sum: number, m: any) => {
              return sum + m.lessons.filter((l: any) =>
                updatedProgress.some(p => p.item_id === l.id && p.item_type === 'lesson' && p.status === 'completed')
              ).length;
            }, 0);
            const courseProgressObj = {
              user_id: user.id,
              item_id: course.id,
              item_type: 'course',
              status: completedInCourse === totalLessons ? 'completed' : 'in_progress',
              progress_percentage: Math.round((completedInCourse / (totalLessons || 1)) * 100),
              updated_at: new Date().toISOString()
            };
            await supabase.from('user_progress').upsert(courseProgressObj, { onConflict: 'user_id, item_id, item_type' });

            setUserProgress([...userProgress, lessonProgressEntry, moduleProgressObj, courseProgressObj]);
            setShowXPAnimation(true);

            let finalXp = lesson.xp_reward;
            if (solutionUsed) {
              finalXp = 0;
            } else if (hintUsed) {
              finalXp = Math.max(1, Math.floor(lesson.xp_reward * 0.5));
            }

            if (finalXp > 0) {
              await supabase.rpc('add_user_xp', { p_user_id: user.id, p_amount: finalXp });
              if (userProfile) {
                userProfile.xp = (userProfile.xp || 0) + finalXp;
              }
            }

            // --- ACHIEVEMENT CHECKS ---
            if (userProfile) {
              const currentAchievements: string[] = userProfile.achievements || [];
              const newlyUnlocked: string[] = [];

              // 1. First Blood (Complete first lesson)
              if (!currentAchievements.includes('first_blood')) {
                newlyUnlocked.push('first_blood');
              }

              // 2. Night Owl (Code between 12 AM and 4 AM)
              const hour = new Date().getHours();
              if (hour >= 0 && hour <= 4 && !currentAchievements.includes('night_owl')) {
                newlyUnlocked.push('night_owl');
              }

              // 3. Desperate Times (Use hint)
              if (hintUsed && !currentAchievements.includes('hint_abuser')) {
                newlyUnlocked.push('hint_abuser');
              }

              // 4. On Fire (3-day streak)
              if ((userProfile.streak || 0) >= 3 && !currentAchievements.includes('on_fire')) {
                newlyUnlocked.push('on_fire');
              }

              // 5. Unstoppable (7-day streak)
              if ((userProfile.streak || 0) >= 7 && !currentAchievements.includes('unstoppable')) {
                newlyUnlocked.push('unstoppable');
              }

              // 6. Deep Pockets (Accumulate 500 XP)
              if ((userProfile.xp || 0) >= 500 && !currentAchievements.includes('wealthy')) {
                newlyUnlocked.push('wealthy');
              }

              if (newlyUnlocked.length > 0) {
                const updatedAchievements = [...currentAchievements, ...newlyUnlocked];

                // Update DB
                await supabase
                  .from('profiles')
                  .update({ achievements: updatedAchievements })
                  .eq('id', user.id);

                // Update Local State
                setUserProfile({ ...userProfile, achievements: updatedAchievements });

                // Dispatch notification for each
                newlyUnlocked.forEach(achId => {
                  // We can infer title from id or just show a general message since we lack the full dict here
                  const titles: Record<string, string> = {
                    first_blood: 'First Blood',
                    night_owl: 'Night Owl',
                    hint_abuser: 'Desperate Times',
                    on_fire: 'On Fire',
                    unstoppable: 'Unstoppable',
                    wealthy: 'Deep Pockets'
                  };
                  toast(
                    <div className="flex items-center gap-2">
                      <LuTrophy className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-bold text-yellow-500">Achievement Unlocked!</p>
                        <p className="text-sm">{titles[achId] || 'New Badge Earned'}</p>
                      </div>
                    </div>,
                    { duration: 5000 }
                  );
                });
              }
            }
            // --- END CHECKS ---

            toast.success(
              <div>
                <p className="font-semibold">{solutionUsed ? 'Lesson Finished' : 'Lesson Complete!'}</p>
                <p className="text-sm">+{finalXp} XP earned {solutionUsed ? '(Solution used: 0 XP)' : hintUsed ? '(Hint used: -50%)' : ''}</p>
              </div>
            );

            setTimeout(() => {
              setShowXPAnimation(false);
            }, 2000);
          } else {
            toast.success(
              <div>
                <p className="font-semibold">Correct!</p>
                <p className="text-sm">Code executed successfully.</p>
              </div>
            );
          }
        } catch (e) {
          console.error('Failed to submit lesson', e);
          toast.error('Failed to save progress.');
        }
      } else if (!isCorrect) {
        toast.error(
          <div>
            <p className="font-semibold">Not quite right</p>
            <p className="text-sm">Check your code and any output errors.</p>
          </div>
        );
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DashboardLayout>
      {showXPAnimation && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-gradient-to-br from-primary to-accent text-white px-8 py-6 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3">
              <LuTrophy className="w-12 h-12" />
              <div>
                <p className="text-2xl font-bold heading-font">+{solutionUsed ? 0 : hintUsed ? Math.max(1, Math.floor(lesson.xp_reward * 0.5)) : lesson.xp_reward} XP</p>
                <p className="text-white/90">Level Up!</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col h-screen">
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/courses/${courseId}`)}>
                <LuArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h2 className="font-semibold text-foreground">{lesson.title}</h2>
                <p className="text-xs text-muted-foreground">{module.title} - {course.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isCompleted && (
                <Badge className="bg-success text-success-foreground">
                  <LuCircleCheck className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              <Badge variant="outline" className="border-primary text-primary">
                <LuZap className="w-3 h-3 mr-1" />
                {lesson.xp_reward} XP
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 overflow-y-auto bg-card p-8 border-r border-border">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 lesson-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.content || ''}
                </ReactMarkdown>
              </div>

              <Card className="mb-8 border-border overflow-hidden bg-[#1e1e1e]">
                <div className="bg-[#17181b] border-b border-[#24262b] px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-white/70">Example</span>
                  <Badge className="bg-white/10 text-white text-xs">{lesson.language || 'code'}</Badge>
                </div>
                <div className="bg-[#1e1e1e]">
                  <Editor
                    height="200px"
                    language={lesson.language || 'javascript'}
                    value={lesson.code_example || ''}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                      <LuTrophy className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Your Challenge</h3>
                      <p className="text-sm text-muted-foreground">{lesson.exercise_prompt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!showHint && !hintUsed) {
                        if (userProfile && (userProfile.xp || 0) < 100) {
                          toast.error("Not enough XP! You need at least 100 XP to use a hint.");
                          return;
                        }
                        if (user) {
                          await supabase.rpc('add_user_xp', { p_user_id: user.id, p_amount: -100 });
                          toast.info("100 XP deducted for using a hint!");
                          if (userProfile) {
                            setUserProfile({ ...userProfile, xp: (userProfile.xp || 0) - 100 });
                          }
                        }
                        setHintUsed(true);
                      }
                      setShowHint(!showHint);
                    }}
                    className="border-accent text-accent hover:bg-accent/10"
                  >
                    <LuLightbulb className="w-4 h-4 mr-2" />
                    {showHint ? 'Hide' : 'Show'} Hint
                  </Button>
                  {!showHint && !hintUsed && (
                    <span className="text-xs text-accent/80 font-medium">Costs 100 XP</span>
                  )}
                  {hintUsed && (
                    <span className="text-xs text-muted-foreground font-medium">-100 XP applied</span>
                  )}
                </div>
                {showHint && (
                  <Card className="mt-3 border-accent/20 bg-accent/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Try breaking down the problem into smaller steps. Make sure to use the correct variable types and syntax.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowSolution(!showSolution);
                      if (!showSolution) setSolutionUsed(true);
                    }}
                    className="border-destructive/60 text-destructive hover:bg-destructive/10"
                  >
                    {showSolution ? <LuEyeOff className="w-4 h-4 mr-2" /> : <LuEye className="w-4 h-4 mr-2" />}
                    {showSolution ? 'Hide' : 'View'} Solution
                  </Button>
                  {!showSolution && !solutionUsed && (
                    <span className="text-xs text-destructive/80 font-medium">?? Forfeits all XP for this lesson</span>
                  )}
                  {solutionUsed && (
                    <span className="text-xs text-muted-foreground font-medium">0 XP will be awarded</span>
                  )}
                </div>
                {showSolution && (
                  <Card className="mt-3 border-border overflow-hidden">
                    <div className="bg-foreground px-4 py-2">
                      <span className="text-sm text-white/70">Solution</span>
                    </div>
                    <div className="bg-[#1e1e1e]">
                      <Editor
                        height="150px"
                        language={lesson.language || 'javascript'}
                        value={lesson.exercise_solution || ''}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={lesson.language || 'javascript'}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                onMount={(editor, monaco) => {
                  editor.onKeyDown((e: any) => {
                    // Prevent Ctrl+V or Cmd+V
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
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>

            <div className="bg-[#252525] px-6 py-4 border-t border-[#3e3e3e] flex items-center gap-3">
              <Button
                onClick={handleRun}
                disabled={isRunning}
                variant="outline"
                className="bg-[#1e1e1e] text-white border-[#3e3e3e] hover:bg-[#2d2d2d]"
              >
                <LuPlay className="w-4 h-4 mr-2" />
                Run Code
              </Button>
              <Button onClick={handleSubmit} disabled={isRunning} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <LuCircleCheck className="w-4 h-4 mr-2" />
                {isCompleted ? 'Completed' : 'Submit'}
              </Button>
              {nextLesson && isCompleted && (
                <Button
                  onClick={() => navigate(`/courses/${nextLesson?.courseId}/modules/${nextLesson?.moduleId}/lessons/${nextLesson?.lessonId}`)}
                  className="ml-auto bg-success text-success-foreground hover:bg-success/90"
                >
                  Next Lesson
                  <LuChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e3e] overflow-auto">
              <div className="px-6 py-3 bg-[#252525] border-b border-[#3e3e3e]">
                <span className="text-sm text-white/70">Console Output</span>
              </div>
              <pre className="p-6 text-sm text-white/90 font-mono">{output || '// Run your code to see output here'}</pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout >
  );
}





