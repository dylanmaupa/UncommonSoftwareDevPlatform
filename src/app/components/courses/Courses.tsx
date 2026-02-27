import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { LuArrowRight, LuBookOpen, LuClock } from 'react-icons/lu';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cData, error: cErr } = await supabase.from('courses').select('*');
        if (!cErr && cData) setCourses(cData);

        const { data: pData, error: pErr } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (!pErr && pData) setUserProgress(pData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2 text-foreground">
            All Courses
          </h1>
          <p className="text-muted-foreground">
            All courses are free and unlocked. Start learning anytime!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const pEntry = userProgress.find(p => p.item_id === course.id && p.item_type === 'course');
            const progress = pEntry ? pEntry.progress_percentage : 0;
            const isStarted = progress > 0;

            const difficultyColor: any = {
              Beginner: 'bg-success/10 text-success border-success/20',
              Intermediate: 'bg-accent/10 text-accent border-accent/20',
              Advanced: 'bg-destructive/10 text-destructive border-destructive/20',
            }[course.difficulty] || '';

            return (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card className="h-full rounded-2xl border-border hover:border-primary hover:shadow-md transition-all group">
                  <CardContent className="space-y-3 p-3">
                    <img
                      src={getCourseImage(course.title)}
                      alt={course.title}
                      className="h-32 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-2 text-base text-foreground">{course.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                      </div>
                      <Badge className={`${difficultyColor} border flex-shrink-0`}>{course.difficulty}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <LuBookOpen className="w-4 h-4" />
                        <span>{course.total_lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LuClock className="w-4 h-4" />
                        <span>{course.estimated_hours}h</span>
                      </div>
                    </div>
                    {isStarted ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-primary">
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-primary font-medium group-hover:gap-2 transition-all">
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

        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <LuBookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold heading-font text-foreground mb-2">
              No courses yet
            </h3>
            <p className="text-muted-foreground">
              Check back soon for new courses!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
