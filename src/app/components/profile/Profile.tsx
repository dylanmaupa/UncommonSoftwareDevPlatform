import { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
// @ts-ignore
import profileAvatar from '../../../assets/avatar2.png';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import {
  LuBookOpen,
  LuPencil,
  LuFlame,
  LuFolderKanban,
  LuSave,
  LuTarget,
  LuTrophy,
  LuX,
  LuZap,
} from 'react-icons/lu';
import { supabase } from '../../../lib/supabase';
import StreakWidget from '../dashboard/StreakWidget';

export default function Profile() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setAuthUser(user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          setNickname(profile.full_name || '');
        }

        const { data: cData } = await supabase.from('courses').select('*');
        if (cData) setCourses(cData);

        const { data: pData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        if (pData) setUserProgress(pData);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (!userProfile || !authUser) return null;

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      await supabase
        .from('profiles')
        .update({ full_name: nickname.trim() })
        .eq('id', authUser.id);

      setUserProfile((prev: any) => ({ ...prev, full_name: nickname.trim() }));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setNickname(userProfile.full_name || '');
    setIsEditing(false);
  };

  // Mocked out gamification stats that would typically live in another table
  const userStats = {
    xp: userProfile.xp || 0,
    level: 1,
    streak: userProfile.streak || 0,
    completedLessons: userProgress.filter(p => p.item_type === 'lesson' && p.status === 'completed'),
    completedProjects: [],
    achievements: [],
  };

  const xpToNextLevel = userStats.level * 500 - userStats.xp;
  const progressToNextLevel = ((userStats.xp % 500) / 500) * 100;

  const coursesWithProgress = courses.map(course => {
    const courseProgressRecord = userProgress.find(p => p.item_id === course.id && p.item_type === 'course');
    return {
      ...course,
      progress: courseProgressRecord ? courseProgressRecord.progress_percentage : 0
    };
  });

  const coursesInProgress = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = coursesWithProgress.filter(c => c.progress === 100);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2 text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4">
          <div className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardContent className="p-4">
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="w-20 h-20 mb-3">
                    <AvatarImage src={profileAvatar} alt={userProfile.full_name} />
                    <AvatarFallback className="text-2xl">{userProfile.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>

                  {isEditing ? (
                    <div className="w-full space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="nickname">Name</Label>
                        <Input
                          id="nickname"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="h-10 rounded-xl bg-secondary border-0"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <LuSave className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} size="sm" variant="outline" className="flex-1 rounded-lg">
                          <LuX className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl heading-font text-foreground mb-1">{userProfile.full_name}</h2>
                      <p className="text-sm text-muted-foreground mb-3">{authUser.email}</p>
                      <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="rounded-lg">
                        <LuPencil className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Level</span>
                      <span className="text-2xl font-semibold heading-font text-primary">{userStats.level}</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{xpToNextLevel} XP to level {userStats.level + 1}</p>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Member since{' '}
                    {new Date(authUser.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LuZap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-foreground">{userStats.xp}</p>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <LuBookOpen className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-foreground">{userStats.completedLessons.length}</p>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LuFolderKanban className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-foreground">{userStats.completedProjects.length}</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <LuTrophy className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-foreground">{userStats.achievements.length}</p>
                      <p className="text-xs text-muted-foreground">Achievements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <LuTarget className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold heading-font text-foreground">{completedCourses.length}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <StreakWidget streak={userStats.streak} userId={authUser.id} />

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font">Courses in Progress</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {coursesInProgress.length > 0 ? (
                  <div className="space-y-3">
                    {coursesInProgress.map((course) => {
                      return (
                        <div key={course.id} className="flex items-center gap-3 rounded-xl bg-sidebar p-2">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl flex-shrink-0">
                            {course.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mb-1">{course.title}</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={course.progress} className="h-2 flex-1" />
                              <span className="text-sm font-medium text-primary">{course.progress}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No courses in progress. Start learning today!</p>
                )}
              </CardContent>
            </Card>

            {userStats.achievements.length > 0 && (
              <Card className="rounded-2xl border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="heading-font">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-3">
                    {userStats.achievements.slice(0, 6).map((achievementId) => (
                      <Badge key={achievementId} className="bg-gradient-to-br from-accent to-primary text-white px-4 py-2">
                        <LuTrophy className="w-4 h-4 mr-2" />
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
