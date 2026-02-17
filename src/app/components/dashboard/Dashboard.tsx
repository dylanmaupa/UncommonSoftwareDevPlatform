import { Link } from 'react-router';
import DashboardLayout from '../layout/DashboardLayout';
import { authService, coursesData, progressService } from '../../services/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Zap,
  Target,
  Flame,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';

export default function Dashboard() {
  const user = authService.getCurrentUser();

  if (!user) return null;

  const totalLessons = user.completedLessons.length;
  const overallProgress = Math.min(
    Math.round((totalLessons / 50) * 100),
    100
  );

  const coursesWithProgress = coursesData.map(course => ({
    ...course,
    progress: progressService.getCourseProgress(course.id),
  }));

  const inProgressCourses = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  const nextCourse = inProgressCourses[0] || coursesData[0];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl heading-font" style={{ color: '#1a1a2e' }}>
              Welcome back, {user.nickname}!
            </h1>
            <Sparkles className="w-6 h-6 text-[#FF6B35]" />
          </div>
          <p className="text-[#6B7280] text-lg">
            Keep up the great work on your coding journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-[rgba(0,0,0,0.08)] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Total XP</p>
                  <p className="text-3xl font-semibold heading-font" style={{ color: '#0747a1' }}>
                    {user.xp}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#0747a1]/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#0747a1]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[rgba(0,0,0,0.08)] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Current Level</p>
                  <p className="text-3xl font-semibold heading-font" style={{ color: '#8B5CF6' }}>
                    {user.level}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#8B5CF6]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[rgba(0,0,0,0.08)] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Day Streak</p>
                  <p className="text-3xl font-semibold heading-font" style={{ color: '#FF6B35' }}>
                    {user.streak}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[#FF6B35]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[rgba(0,0,0,0.08)] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Lessons Done</p>
                  <p className="text-3xl font-semibold heading-font" style={{ color: '#10B981' }}>
                    {totalLessons}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#10B981]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-[rgba(0,0,0,0.08)] shadow-sm">
              <CardHeader>
                <CardTitle className="heading-font">Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-xl bg-white border-2 border-[#0747a1]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0747a1]/10 text-[#0747a1] flex items-center justify-center text-2xl flex-shrink-0">
                      {nextCourse.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold heading-font mb-1 text-[#1a1a2e]">
                        {nextCourse.title}
                      </h3>
                      <p className="text-[#6B7280] text-sm mb-4">
                        {nextCourse.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#6B7280]">Progress</span>
                          <span className="text-[#0747a1] font-medium">{progressService.getCourseProgress(nextCourse.id)}%</span>
                        </div>
                        <Progress
                          value={progressService.getCourseProgress(nextCourse.id)}
                          className="h-2 bg-[#F5F5FA]"
                        />
                      </div>
                      <Link to={`/courses/${nextCourse.id}`}>
                        <Button className="bg-[#0747a1] text-white hover:bg-[#0747a1]/90">
                          Continue Course
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Courses */}
            <Card className="border-[rgba(0,0,0,0.08)] shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="heading-font">Available Courses</CardTitle>
                  <Link to="/courses">
                    <Button variant="ghost" size="sm" className="text-[#0747a1]">
                      View All
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coursesData.slice(0, 4).map((course) => {
                    const progress = progressService.getCourseProgress(course.id);

                    return (
                      <Link
                        key={course.id}
                        to={`/courses/${course.id}`}
                        className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] hover:border-[#0747a1] hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F5F5FA] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {course.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#1a1a2e] mb-1 truncate">
                              {course.title}
                            </h4>
                            <p className="text-xs text-[#6B7280] mb-2">
                              {course.totalLessons} lessons • {course.difficulty}
                            </p>
                            {progress > 0 && (
                              <Progress value={progress} className="h-1" />
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card className="border-[rgba(0,0,0,0.08)] shadow-sm">
              <CardHeader>
                <CardTitle className="heading-font flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#F59E0B]" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.achievements.slice(0, 3).map((achievementId) => (
                    <div
                      key={achievementId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5FA]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-lg">
                        🏆
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e]">
                          Achievement Unlocked
                        </p>
                        <p className="text-xs text-[#6B7280]">Keep going!</p>
                      </div>
                    </div>
                  ))}
                  {user.achievements.length === 0 && (
                    <p className="text-sm text-[#6B7280] text-center py-4">
                      Complete lessons to earn achievements!
                    </p>
                  )}
                  <Link to="/achievements">
                    <Button variant="ghost" size="sm" className="w-full text-[#0747a1]">
                      View All Achievements
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Learning Tip */}
            <Card className="border-[rgba(0,0,0,0.08)] shadow-sm bg-gradient-to-br from-[#FF6B35]/5 to-[#F59E0B]/5">
              <CardHeader>
                <CardTitle className="heading-font flex items-center gap-2 text-[#FF6B35]">
                  <BookOpen className="w-5 h-5" />
                  Daily Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#6B7280]">
                  💡 Practice coding for at least 30 minutes daily to maintain your streak and build consistent learning habits!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
