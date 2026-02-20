import { LuChevronRight, LuEye, LuEyeOff, LuLightbulb, LuPlay, LuTrophy, LuZap } from 'react-icons/lu';

import { motion } from 'motion/react';

export default function LessonView() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [code, setCode] = LuuseState('');
  const [output, setOutput] = LuuseState('');
  const [showHint, setShowHint] = LuuseState(false);
  const [showSolution, setShowSolution] = LuuseState(false);
  const [isRunning, setIsRunning] = LuuseState(false);
  const [showXPAnimation, setShowXPAnimation] = LuuseState(false);

  // Find the lesson
  const course = coursesData.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);
  const lesson = module?.lessons.find(l => l.id === lessonId);
  
  const isCompleted = lesson ? LuprogressService.isLessonCompleted(lesson.id) : false;

  // Find next lesson
  let nextLesson: { courseId: string; moduleId: string; lessonId: string } | null = null;
  if (course && module && lesson) {
    const currentLessonIndex = module.lessons.findIndex(l => l.id === lesson.id);
    if (currentLessonIndex < module.lessons.length - 1) {
      // Next lesson in same module
      nextLesson = {
        courseId: course.id,
        moduleId: module.id,
        lessonId: module.lessons[currentLessonIndex + 1].id,
      };
    } else {
      // First lesson of next module
      const currentModuleIndex = course.modules.findIndex(m => m.id === module.id);
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

  useEffect(() => {
    if (lesson) {
      setCode(lesson.exercise.starterCode);
      setOutput('');
      setShowHint(false);
      setShowSolution(false);
    }
  }, [lessonId, lesson]);

  if (!lesson || !module || !course) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-[#6B7280]">Lesson not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    // Simulate code execution
    setTimeout(() => {
      setOutput(
        `✓ Code executed successfully!\n\nOutput:\n-------------------\n` +
        `// This is a simulated output\n` +
        `// In a real environment, your ${lesson.language} code would run here\n\n` +
        `Console output would appear here based on your code.`
      );
      setIsRunning(false);
    }, 800);
  };

  const handleSubmit = () => {
    if (isCompleted) {
      toast.info('You already completed this lesson!');
      return;
    }

    setIsRunning(true);
    
    setTimeout(() => {
      // Simulate checking code
      const isCorrect = Math.random() > 0.3; // 70% success rate for demo
      
      if (isCorrect) {
        LuprogressService.completeLesson(lesson.id, lesson.xpReward);
        setShowXPAnimation(true);
        
        toast.success(
          <div>
            <p className="font-semibold">🎉 Lesson Complete!</p>
            <p className="text-sm">+{lesson.xpReward} XP earned</p>
          </div>
        );

        setTimeout(() => {
          setShowXPAnimation(false);
        }, 2000);
      } else {
        toast.error(
          <div>
            <p className="font-semibold">Not quite right</p>
            <p className="text-sm">Check your code and try again, or view the hint</p>
          </div>
        );
      }
      
      setIsRunning(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      {/* XP Animation */}
      {showXPAnimation && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-gradient-to-br from-[#0747a1] to-[#8B5CF6] text-white px-8 py-6 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3">
              <LuTrophy className="w-12 h-12" />
              <div>
                <p className="text-2xl font-bold heading-font">+{lesson.xpReward} XP</p>
                <p className="text-white/90">Level {user?.level}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col h-screen">
        {/* Top Bar */}
        <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-6 py-4">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div className="h-6 w-px bg-[rgba(0,0,0,0.08)]"></div>
              <div>
                <h2 className="font-semibold text-[#1a1a2e]">{lesson.title}</h2>
                <p className="text-xs text-[#6B7280]">
                  {module.title} • {course.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isCompleted && (
                <Badge className="bg-[#10B981] text-white">
                  <LuCheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              <Badge variant="outline" className="border-[#0747a1] text-[#0747a1]">
                <LuZap className="w-3 h-3 mr-1" />
                {lesson.xpReward} XP
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content: Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Lesson Content */}
          <div className="w-1/2 overflow-y-auto bg-white p-8 border-r border-[rgba(0,0,0,0.08)]">
            <div className="max-w-2xl mx-auto">
              {/* Lesson Content */}
              <div className="prose prose-slate max-w-none mb-8">
                <div className="whitespace-pre-wrap text-[#1a1a2e] leading-relaxed">
                  {lesson.content}
                </div>
              </div>

              {/* Code Example */}
              <Card className="mb-8 border-[rgba(0,0,0,0.08)] overflow-hidden">
                <div className="bg-[#1a1a2e] px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-white/70">Example</span>
                  <Badge className="bg-white/10 text-white text-xs">
                    {lesson.language}
                  </Badge>
                </div>
                <div className="bg-[#1e1e1e]">
                  <Editor
                    height="200px"
                    language={lesson.language}
                    value={lesson.codeExample}
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

              {/* Exercise Prompt */}
              <Card className="border-[rgba(91,79,255,0.2)] bg-[#0747a1]/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0747a1] flex items-center justify-center flex-shrink-0">
                      <LuTrophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a2e] mb-2">
                        Your Challenge
                      </h3>
                      <p className="text-sm text-[#6B7280]">
                        {lesson.exercise.prompt}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hint Section */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
                >
                  <LuLightbulb className="w-4 h-4 mr-2" />
                  {showHint ? 'Hide' : 'Show'} Hint
                </Button>
                {showHint && (
                  <Card className="mt-3 border-[#F59E0B]/20 bg-[#F59E0B]/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-[#6B7280]">
                        💡 Try breaking down the problem into smaller steps. Make sure to use the correct variable types and syntax.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Solution Toggle */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSolution(!showSolution)}
                  className="border-[#6B7280] text-[#6B7280]"
                >
                  {showSolution ? <LuEyeOff className="w-4 h-4 mr-2" /> : <LuEye className="w-4 h-4 mr-2" />}
                  {showSolution ? 'Hide' : 'View'} Solution
                </Button>
                {showSolution && (
                  <Card className="mt-3 border-[rgba(0,0,0,0.08)] overflow-hidden">
                    <div className="bg-[#1a1a2e] px-4 py-2">
                      <span className="text-sm text-white/70">Solution</span>
                    </div>
                    <div className="bg-[#1e1e1e]">
                      <Editor
                        height="150px"
                        language={lesson.language}
                        value={lesson.exercise.solution}
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

          {/* Right: Code Editor */}
          <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={lesson.language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
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

            {/* Action Buttons */}
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
              <Button
                onClick={handleSubmit}
                disabled={isRunning}
                style={{ backgroundColor: '#0747a1' }}
              >
                <LuCheckCircle2 className="w-4 h-4 mr-2" />
                {isCompleted ? 'Completed' : 'Submit'}
              </Button>
              {nextLesson && isCompleted && (
                <Button
                  onClick={() => navigate(`/courses/${nextLesson.courseId}/modules/${nextLesson.moduleId}/lessons/${nextLesson.lessonId}`)}
                  style={{ backgroundColor: '#10B981' }}
                  className="ml-auto"
                >
                  Next Lesson
                  <LuChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Output Console */}
            <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e3e] overflow-auto">
              <div className="px-6 py-3 bg-[#252525] border-b border-[#3e3e3e]">
                <span className="text-sm text-white/70">Console Output</span>
              </div>
              <pre className="p-6 text-sm text-white/90 font-mono">
                {output || '// Run your code to see output here'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}