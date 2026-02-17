import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { coursesData, progressService } from '../../services/mockData';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

export default function Courses() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl heading-font mb-2" style={{ color: '#1a1a2e' }}>
            All Courses
          </h1>
          <p className="text-[#6B7280] text-lg">
            All courses are free and unlocked. Start learning anytime!
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData.map((course) => {
            const progress = progressService.getCourseProgress(course.id);
            const isStarted = progress > 0;
            
            const difficultyColor = {
              Beginner: 'bg-[#10B981] text-white',
              Intermediate: 'bg-[#F59E0B] text-white',
              Advanced: 'bg-[#EF4444] text-white',
            }[course.difficulty];

            return (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="h-full border-[rgba(0,0,0,0.08)] hover:border-[#0747a1] hover:shadow-xl transition-all group overflow-hidden">
                  {/* Course Icon Header */}
                  <div className="h-32 bg-gradient-to-br from-[#0747a1]/10 to-[#8B5CF6]/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg5MSwgNzksIDI1NSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
                    <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform">
                      {course.icon}
                    </span>
                  </div>

                  <CardContent className="p-6">
                    {/* Title and Badge */}
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-semibold heading-font text-[#1a1a2e] group-hover:text-[#0747a1] transition-colors">
                          {course.title}
                        </h3>
                        <Badge className={`${difficultyColor} flex-shrink-0`}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6B7280] line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.estimatedHours}h</span>
                      </div>
                    </div>

                    {/* Progress */}
                    {isStarted ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Progress</span>
                          <span className="font-semibold text-[#0747a1]">
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-[#0747a1] font-medium group-hover:gap-2 transition-all">
                        <span>Start Course</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Empty State (if needed) */}
        {coursesData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#F5F5FA] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#6B7280]" />
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
