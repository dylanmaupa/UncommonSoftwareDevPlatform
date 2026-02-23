import { Link, useNavigate, useParams } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { coursesData, progressService } from '../../services/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  LuArrowLeft,
  LuBookOpen,
  LuCircleCheck,
  LuChevronRight,
  LuCircle,
  LuClock,
  LuTarget,
} from 'react-icons/lu';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const course = coursesData.find(c => c.id === courseId);

  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Course not found</p>
          <Link to="/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const courseProgress = progressService.getCourseProgress(course.id);
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = course.modules
    .flatMap(m => m.lessons)
    .filter(l => progressService.isLessonCompleted(l.id))
    .length;

  const difficultyColor = {
    Beginner: 'bg-success text-success-foreground',
    Intermediate: 'bg-accent text-accent-foreground',
    Advanced: 'bg-destructive text-destructive-foreground',
  }[course.difficulty];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/courses')}
          className="mb-6 -ml-4"
        >
          <LuArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-5xl flex-shrink-0">
              {course.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h1 className="text-4xl heading-font">{course.title}</h1>
                <Badge className={difficultyColor}>
                  {course.difficulty}
                </Badge>
              </div>
              <p className="text-white/90 text-lg mb-6">
                {course.description}
              </p>
              
              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <LuBookOpen className="w-5 h-5" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <LuClock className="w-5 h-5" />
                  <span>{course.estimatedHours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <LuTarget className="w-5 h-5" />
                  <span>{completedLessons}/{totalLessons} completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Course Progress</span>
                  <span className="font-semibold">{courseProgress}%</span>
                </div>
                <Progress value={courseProgress} className="h-2 bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Modules and Lessons */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="heading-font">Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            {course.modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>This course content is coming soon!</p>
              </div>
            ) : (
              <Accordion type="multiple" defaultValue={[course.modules[0]?.id]} className="space-y-4">
                {course.modules.map((module, moduleIndex) => {
                  const moduleProgress = progressService.getModuleProgress(module.id);
                  const completedInModule = module.lessons.filter(l => 
                    progressService.isLessonCompleted(l.id)
                  ).length;

                  return (
                    <AccordionItem
                      key={module.id}
                      value={module.id}
                      className="border border-border rounded-xl px-6 data-[state=open]:bg-secondary/50"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-4 flex-1 text-left">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold flex-shrink-0">
                            {moduleIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1">
                              {module.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {completedInModule}/{module.lessons.length} lessons • {moduleProgress}% complete
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="pl-14 space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => {
                            const isCompleted = progressService.isLessonCompleted(lesson.id);
                            
                            return (
                              <Link
                                key={lesson.id}
                                to={`/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/60 border border-transparent hover:border-border transition-all group"
                              >
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <LuCircleCheck className="w-5 h-5 text-success" />
                                  ) : (
                                    <LuCircle className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium ${
                                    isCompleted ? 'text-muted-foreground' : 'text-foreground'
                                  }`}>
                                    {lessonIndex + 1}. {lesson.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    +{lesson.xpReward} XP
                                  </p>
                                </div>
                                <LuChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                              </Link>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
