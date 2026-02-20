import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { coursesData, progressService } from '../../services/mockData';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { LuArrowRight, LuBookOpen, LuClock } from 'react-icons/lu';

export default function Courses() {
  const getCourseImage = (title: string) => {
    const normalized = title.toLowerCase();

    if (normalized.includes('python')) {
      return 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1000&q=80';
    }
    if (normalized.includes('react')) {
      return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1000&q=80';
    }
    if (normalized.includes('javascript') || normalized.includes('node')) {
      return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80';
    }

    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80';
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2" style={{ color: '#1a1a2e' }}>
            All Courses
          </h1>
          <p className="text-[#6B7280]">
            All courses are free and unlocked. Start learning anytime!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursesData.map((course) => {
            const progress = progressService.getCourseProgress(course.id);
            const isStarted = progress > 0;

            const difficultyColor = {
              Beginner: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
              Intermediate: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
              Advanced: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
            }[course.difficulty];

            return (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="h-full rounded-2xl border-[rgba(0,0,0,0.08)] hover:shadow-md transition-all group">
                  <CardContent className="space-y-3 p-3">
                    <img
                      src={getCourseImage(course.title)}
                      alt={course.title}
                      className="h-32 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-2 text-base text-[#1a1a2e]">{course.title}</p>
                        <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">{course.description}</p>
                      </div>
                      <Badge className={`${difficultyColor} border flex-shrink-0`}>{course.difficulty}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <LuBookOpen className="w-4 h-4" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LuClock className="w-4 h-4" />
                        <span>{course.estimatedHours}h</span>
                      </div>
                    </div>
                    {isStarted ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6B7280]">Progress</span>
                          <span className="font-semibold text-[#0747a1]">
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-[#0747a1] font-medium group-hover:gap-2 transition-all">
                        <span>Start Course</span>
                        <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {coursesData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#F5F5FA] flex items-center justify-center mx-auto mb-4">
              <LuBookOpen className="w-8 h-8 text-[#6B7280]" />
            </div>
            <h3 className="text-xl font-semibold heading-font text-[#1a1a2e] mb-2">
              No courses yet
            </h3>
            <p className="text-[#6B7280]">
              Check back soon for new courses!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
