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

        if (!pErr && pData) {
          setUserProgress(pData);

          // Sort courses by user progress (most used first)
          if (cData) {
            const sortedCourses = [...cData].sort((a, b) => {
              const pA = pData.find(p => p.item_id === a.id && p.item_type === 'course');
              const pB = pData.find(p => p.item_id === b.id && p.item_type === 'course');
              const progressA = pA ? pA.progress_percentage : 0;
              const progressB = pB ? pB.progress_percentage : 0;

              return progressB - progressA; // Descending order
            });
            setCourses(sortedCourses);
          }
        } else if (cData) {
          setCourses(cData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  const comingSoonCourseKeywords = ['javascript', 'node', 'data structures', 'data-structures', 'datastructures', 'react fundamentals', 'react-fundamentals'];

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
            Most courses are free and unlocked. Some are marked Coming Soon.
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

            const searchText = `${course.id || ''} ${course.title || ''} ${course.description || ''}`.toLowerCase();
            const isComingSoonCourse = comingSoonCourseKeywords.some((keyword) => searchText.includes(keyword));

            const courseCard = (
              <Card
                className={`h-full rounded-2xl border-border transition-all group ${isComingSoonCourse ? 'overflow-hidden' : 'hover:border-primary hover:shadow-md'}`}
              >
                <CardContent className={`space-y-3 p-3 ${isComingSoonCourse ? 'blur-[2px] pointer-events-none select-none' : ''}`}>
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
                  {isComingSoonCourse ? (
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                      <span>Coming soon</span>
                    </div>
                  ) : isStarted ? (
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
            );

            if (isComingSoonCourse) {
              return (
                <div key={course.id} className="relative overflow-hidden rounded-2xl">
                  {courseCard}
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-white/15 bg-black/35 backdrop-blur-sm shadow-[inset_0_0_36px_rgba(255,255,255,0.12)]">
                    <span className="rounded-full border border-white/30 bg-black/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
                      Coming Soon
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link key={course.id} to={`/courses/${course.id}`}>
                {courseCard}
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

