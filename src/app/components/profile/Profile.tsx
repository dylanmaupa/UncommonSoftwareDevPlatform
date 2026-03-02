import { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
// @ts-ignore
import profileAvatar from '../../../assets/avatar2.png';
import { getAvatarsByGender, getRandomAvatar, type Gender } from '../../lib/avatars';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
import { calculateUserLevel, calculateNextLevelXp, calculateLevelProgress } from '../../../lib/gamificationUtils';
import StreakWidget from '../dashboard/StreakWidget';

export default function Profile() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [gender, setGender] = useState<Gender | ''>('');
  const [isGenderSaving, setIsGenderSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');

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
          setGender(profile.gender || '');
          setSelectedAvatar(profile.avatar_url || '');
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
  const handleGenderSave = async () => {
    if (!gender) {
      toast.error('Please select a gender');
      return;
    }

    const pool = getAvatarsByGender(gender);
    if (pool.length > 0 && !selectedAvatar) {
      toast.error('Please choose an avatar');
      return;
    }

    try {
      setIsGenderSaving(true);
      const avatarUrl = selectedAvatar || getRandomAvatar(gender) || userProfile.avatar_url || profileAvatar;

      await supabase
        .from('profiles')
        .update({ gender, avatar_url: avatarUrl })
        .eq('id', authUser.id);

      setUserProfile((prev: any) => ({ ...prev, gender, avatar_url: avatarUrl }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update gender');
    } finally {
      setIsGenderSaving(false);
    }
  };


  const availableAvatars = gender ? getAvatarsByGender(gender) : [];

  useEffect(() => {
    if (!gender || availableAvatars.length === 0) {
      setSelectedAvatar('');
      return;
    }

    if (!selectedAvatar || !availableAvatars.includes(selectedAvatar)) {
      if (userProfile?.avatar_url && availableAvatars.includes(userProfile.avatar_url)) {
        setSelectedAvatar(userProfile.avatar_url);
      } else {
        setSelectedAvatar(availableAvatars[0]);
      }
    }
  }, [gender, availableAvatars, selectedAvatar, userProfile?.avatar_url]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (!userProfile || !authUser) return null;
  // Mocked out gamification stats that would typically live in another table
  const userStats = {
    xp: userProfile.xp || 0,
    level: calculateUserLevel(userProfile.xp),
    streak: userProfile.streak || 0,
    completedLessons: userProgress.filter(p => p.item_type === 'lesson' && p.status === 'completed'),
    completedProjects: [],
    achievements: userProfile.achievements || [],
  };

  const xpToNextLevel = calculateNextLevelXp(userStats.level) - userStats.xp;
  const progressToNextLevel = calculateLevelProgress(userStats.xp);

  const coursesWithProgress = courses.map(course => {
    const courseProgressRecord = userProgress.find(p => p.item_id === course.id && p.item_type === 'course');
    return {
      ...course,
      progress: courseProgressRecord ? courseProgressRecord.progress_percentage : 0
    };
  });

  const coursesInProgress = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = coursesWithProgress.filter(c => c.progress === 100);

  const needsGender = !userProfile.gender;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl heading-font mb-2 text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>

        <Card className={`rounded-2xl border-border mb-4 ${needsGender ? 'bg-secondary/60 ring-1 ring-primary/20' : 'bg-secondary/40'}`}>
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg heading-font text-foreground">Gender</h2>
                <p className="text-sm text-muted-foreground">
                  {needsGender
                    ? 'Select your gender to set a default avatar. You can update this later.'
                    : 'Update your gender to refresh your avatar.'}
                </p>
              </div>
              {needsGender && (
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Required
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={(value: Gender) => setGender(value)}>
                <SelectTrigger className="w-full h-10 bg-secondary border-0 rounded-xl">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {gender && (
              <div className="space-y-2">
                <Label>Choose Avatar</Label>
                {availableAvatars.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 rounded-xl bg-secondary/70 p-3">
                    {availableAvatars.map((avatar, index) => {
                      const isActive = selectedAvatar === avatar;

                      return (
                        <button
                          key={`${gender}-avatar-${index}`}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`aspect-square overflow-hidden rounded-xl border transition ${
                            isActive
                              ? 'border-primary ring-2 ring-primary/40'
                              : 'border-transparent hover:border-primary/40'
                          }`}
                          aria-label={`Select avatar ${index + 1}`}
                        >
                          <img src={avatar} alt={`Avatar option ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No avatars found for this gender yet.</p>
                )}
              </div>
            )}
            <Button
              onClick={handleGenderSave}
              disabled={!gender || isGenderSaving || (availableAvatars.length > 0 && !selectedAvatar)}
              className="self-start rounded-xl"
            >
              {isGenderSaving ? 'Saving...' : 'Save Gender'}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-4">
          <div className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardContent className="p-4">
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="w-20 h-20 mb-3">
                    <AvatarImage src={userProfile.avatar_url || profileAvatar} alt={userProfile.full_name} />
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


















