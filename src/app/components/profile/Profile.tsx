import { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { authService, coursesData, progressService } from '../../services/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { 
  Edit, 
  Save, 
  X, 
  Trophy, 
  Zap, 
  Target, 
  BookOpen, 
  FolderKanban,
  Flame
} from 'lucide-react';

export default function Profile() {
  const user = authService.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');

  if (!user) return null;

  const handleSave = () => {
    if (!nickname.trim()) {
      toast.error('Nickname cannot be empty');
      return;
    }

    authService.updateUser({ nickname: nickname.trim() });
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNickname(user.nickname);
    setIsEditing(false);
  };

  const xpToNextLevel = ((user.level) * 500) - user.xp;
  const progressToNextLevel = ((user.xp % 500) / 500) * 100;

  const coursesInProgress = coursesData.filter(course => {
    const progress = progressService.getCourseProgress(course.id);
    return progress > 0 && progress < 100;
  });

  const completedCourses = coursesData.filter(course => {
    const progress = progressService.getCourseProgress(course.id);
    return progress === 100;
  });

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2" style={{ color: '#1a1a2e' }}>
            Profile
          </h1>
          <p className="text-[#6B7280]">
            Track your progress and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4">
          {/* Profile Info */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
              <CardContent className="p-4">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="w-20 h-20 mb-3">
                    <AvatarImage src={user.avatar} alt={user.nickname} />
                    <AvatarFallback className="text-2xl">{user.nickname[0]}</AvatarFallback>
                  </Avatar>
                  
                  {isEditing ? (
                    <div className="w-full space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="nickname">Nickname</Label>
                        <Input
                          id="nickname"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="h-10 rounded-xl bg-[#F5F5FA] border-0"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="flex-1 rounded-lg"
                          style={{ backgroundColor: '#0747a1' }}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancel}
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl heading-font text-[#1a1a2e] mb-1">
                        {user.nickname}
                      </h2>
                      <p className="text-sm text-[#6B7280] mb-3">{user.email}</p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>

                {/* Level Progress */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#0747a1]/10 to-[#8B5CF6]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#6B7280]">Level</span>
                      <span className="text-2xl font-semibold heading-font text-[#0747a1]">
                        {user.level}
                      </span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2 mb-2" />
                    <p className="text-xs text-[#6B7280]">
                      {xpToNextLevel} XP to level {user.level + 1}
                    </p>
                  </div>

                  {/* Member Since */}
                  <div className="text-center text-sm text-[#6B7280]">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Progress */}
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0747a1]/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#0747a1]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-[#1a1a2e]">
                        {user.xp}
                      </p>
                      <p className="text-xs text-[#6B7280]">Total XP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-[#1a1a2e]">
                        {user.streak}
                      </p>
                      <p className="text-xs text-[#6B7280]">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-[#1a1a2e]">
                        {user.completedLessons.length}
                      </p>
                      <p className="text-xs text-[#6B7280]">Lessons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-[#1a1a2e]">
                        {user.completedProjects.length}
                      </p>
                      <p className="text-xs text-[#6B7280]">Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-[#1a1a2e]">
                        {user.achievements.length}
                      </p>
                      <p className="text-xs text-[#6B7280]">Achievements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#06B6D4]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-[#1a1a2e]">
                        {completedCourses.length}
                      </p>
                      <p className="text-xs text-[#6B7280]">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Courses in Progress */}
            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font">Courses in Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {coursesInProgress.length > 0 ? (
                  <div className="space-y-3">
                    {coursesInProgress.map((course) => {
                      const progress = progressService.getCourseProgress(course.id);
                      
                      return (
                        <div key={course.id} className="flex items-center gap-3 rounded-xl bg-[#FAFAFA] p-2">
                          <div className="w-10 h-10 rounded-lg bg-[#F5F5FA] flex items-center justify-center text-xl flex-shrink-0">
                            {course.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[#1a1a2e] mb-1">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="h-2 flex-1" />
                              <span className="text-sm font-medium text-[#0747a1]">
                                {progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-[#6B7280] py-4">
                    No courses in progress. Start learning today!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            {user.achievements.length > 0 && (
              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
                <CardHeader className="pb-2">
                  <CardTitle className="heading-font">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-3">
                    {user.achievements.slice(0, 6).map((achievementId) => (
                      <Badge
                        key={achievementId}
                        className="bg-gradient-to-br from-[#F59E0B] to-[#F97316] text-white px-4 py-2"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Achievement
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
