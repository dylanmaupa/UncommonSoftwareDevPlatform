import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
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
  LuBuilding2,
  LuPencil,
  LuFolderKanban,
  LuSave,
  LuTarget,
  LuTrophy,
  LuX,
  LuZap,
} from 'react-icons/lu';
import { supabase } from '../../../lib/supabase';
import { fetchProfileForAuthUser, updateProfileForAuthUser } from '../../lib/profileAccess';
import { calculateUserLevel, calculateNextLevelXp, calculateLevelProgress } from '../../../lib/gamificationUtils';
import StreakWidget from '../dashboard/StreakWidget';

function resolveRole(profile: Record<string, unknown> | null, metadata: Record<string, unknown> | undefined) {
  return String(
    profile?.['role'] ??
    profile?.['user_role'] ??
    metadata?.['role'] ??
    metadata?.['user_role'] ??
    ''
  ).toLowerCase();
}

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
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setAuthUser(user);

        const profile = await fetchProfileForAuthUser(user as any);
        const metadata = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;

        const resolvedProfile = profile ?? {
          email: user.email ?? '',
          full_name: String(metadata?.['full_name'] ?? user.email?.split('@')[0] ?? ''),
          xp: Number(metadata?.['xp'] ?? 0),
          streak: Number(metadata?.['streak'] ?? 0),
          achievements: Array.isArray(metadata?.['achievements']) ? metadata?.['achievements'] : [],
          gender: String(metadata?.['gender'] ?? ''),
          avatar_url: String(metadata?.['avatar_url'] ?? ''),
        };

        const role = resolveRole(resolvedProfile as Record<string, unknown>, metadata);

        setUserRole(role);
        setUserProfile(resolvedProfile);
        setNickname(String(resolvedProfile.full_name ?? ''));
        setGender(String(resolvedProfile.gender ?? '') as Gender | '');
        setSelectedAvatar(String(resolvedProfile.avatar_url ?? ''));

        if (role !== 'instructor') {
          const { data: cData } = await supabase.from('courses').select('*');
          if (cData) setCourses(cData);

          const { data: pData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id);
          if (pData) setUserProgress(pData);
        }
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
      await updateProfileForAuthUser(authUser as any, { full_name: nickname.trim() });
      await supabase.auth.updateUser({ data: { full_name: nickname.trim() } });

      setUserProfile((prev: any) => ({ ...prev, full_name: nickname.trim() }));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
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

      await updateProfileForAuthUser(authUser as any, { gender, avatar_url: avatarUrl });
      await supabase.auth.updateUser({ data: { gender, avatar_url: avatarUrl } });

      setUserProfile((prev: any) => ({ ...prev, gender, avatar_url: avatarUrl }));
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update gender');
    } finally {
      setIsGenderSaving(false);
    }
  };

  const availableAvatars = gender ? getAvatarsByGender(gender) : [];

  useEffect(() => {
    if (!gender) {
      setSelectedAvatar('');
      return;
    }

    if (selectedAvatar && !availableAvatars.includes(selectedAvatar)) {
      setSelectedAvatar('');
    }
  }, [gender, selectedAvatar, availableAvatars]);

  const isInstructor = userRole === 'instructor';

  const userStats = useMemo(() => {
    const xp = Number(userProfile?.xp ?? 0);
    const streak = Number(userProfile?.streak ?? 0);
    const achievements = Array.isArray(userProfile?.achievements) ? userProfile.achievements : [];

    return {
      xp,
      level: calculateUserLevel(xp),
      streak,
      completedLessons: userProgress.filter((p) => p.item_type === 'lesson' && p.status === 'completed'),
      completedProjects: [],
      achievements,
    };
  }, [userProfile, userProgress]);

  const xpToNextLevel = calculateNextLevelXp(userStats.level) - userStats.xp;
  const progressToNextLevel = calculateLevelProgress(userStats.xp);

  const coursesWithProgress = useMemo(() => {
    return courses.map((course) => {
      const courseProgressRecord = userProgress.find((p) => p.item_id === course.id && p.item_type === 'course');
      return {
        ...course,
        progress: courseProgressRecord ? courseProgressRecord.progress_percentage : 0,
      };
    });
  }, [courses, userProgress]);

  const coursesInProgress = coursesWithProgress.filter((c) => c.progress > 0 && c.progress < 100);
  const completedCourses = coursesWithProgress.filter((c) => c.progress === 100);
  const needsGender = !String(userProfile?.gender ?? '');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (!userProfile || !authUser) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl text-foreground heading-font lg:text-4xl">Profile</h1>
          <p className="text-muted-foreground">
            {isInstructor ? 'Manage your instructor account details' : 'Track your progress and achievements'}
          </p>
        </div>

        <Card className={`mb-4 rounded-2xl border-border ${needsGender ? 'bg-secondary/60 ring-1 ring-primary/20' : 'bg-secondary/40'}`}>
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg text-foreground heading-font">Gender</h2>
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
              {gender ? (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/70 p-3">
                  <p className="flex-1 text-sm capitalize text-muted-foreground">Selected: {gender}</p>
                  <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setGender('')}>
                    Change
                  </Button>
                </div>
              ) : (
                <Select value={gender} onValueChange={(value: Gender) => setGender(value)}>
                  <SelectTrigger className="h-10 w-full rounded-xl border-0 bg-secondary">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {gender && (
              <div className="space-y-2">
                <Label>Choose Avatar</Label>
                {availableAvatars.length > 0 ? (
                  selectedAvatar ? (
                    <div className="flex items-center gap-3 rounded-xl bg-secondary/70 p-3">
                      <img src={selectedAvatar} alt="Selected avatar" className="h-16 w-16 rounded-xl object-cover" />
                      <p className="flex-1 text-sm text-muted-foreground">Selected avatar</p>
                      <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setSelectedAvatar('')}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 rounded-xl bg-secondary/70 p-3 sm:grid-cols-6">
                      {availableAvatars.map((avatar, index) => (
                        <button
                          key={`${gender}-avatar-${index}`}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar)}
                          className="aspect-square overflow-hidden rounded-xl border border-transparent transition hover:border-primary/40"
                          aria-label={`Select avatar ${index + 1}`}
                        >
                          <img src={avatar} alt={`Avatar option ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardContent className="p-4">
                <div className="mb-4 flex flex-col items-center">
                  <Avatar className="mb-3 h-20 w-20">
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
                          className="h-10 rounded-xl border-0 bg-secondary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm" className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                          <LuSave className="mr-1 h-4 w-4" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} size="sm" variant="outline" className="flex-1 rounded-lg">
                          <LuX className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="mb-1 text-xl text-foreground heading-font">{userProfile.full_name}</h2>
                      <p className="mb-3 text-sm text-muted-foreground">{authUser.email}</p>
                      <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="rounded-lg">
                        <LuPencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>

                <div className="space-y-3">
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
            {isInstructor ? (
              <>
                <Card className="rounded-2xl border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="heading-font">Instructor Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0 text-sm">
                    <div className="flex items-center justify-between rounded-xl bg-sidebar p-3">
                      <span className="text-muted-foreground">Role</span>
                      <Badge className="border border-primary/20 bg-primary/10 text-primary">Instructor</Badge>
                    </div>
                    <div className="rounded-xl bg-sidebar p-3">
                      <p className="text-muted-foreground">Email</p>
                      <p className="mt-1 text-foreground">{authUser.email}</p>
                    </div>
                    <div className="rounded-xl bg-sidebar p-3">
                      <p className="text-muted-foreground">Workspace</p>
                      <p className="mt-1 text-foreground">Instructor Dashboard</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="heading-font">Quick Access</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-2 pt-0">
                    <Link to="/instructor">
                      <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm">
                        Instructor Home
                        <LuBuilding2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/instructor/students">
                      <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm">
                        Student Tracker
                        <LuTarget className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/instructor/assessments">
                      <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm">
                        Assessments
                        <LuTrophy className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <LuZap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xl text-foreground heading-font">{userStats.xp}</p>
                          <p className="text-xs text-muted-foreground">Total XP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                          <LuBookOpen className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-xl text-foreground heading-font">{userStats.completedLessons.length}</p>
                          <p className="text-xs text-muted-foreground">Lessons</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <LuFolderKanban className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xl text-foreground heading-font">{userStats.completedProjects.length}</p>
                          <p className="text-xs text-muted-foreground">Projects</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                          <LuTrophy className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-xl text-foreground heading-font">{userStats.achievements.length}</p>
                          <p className="text-xs text-muted-foreground">Achievements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                          <LuTarget className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-xl text-foreground heading-font">{completedCourses.length}</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl border-border">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Level</span>
                      <span className="text-2xl text-primary heading-font">{userStats.level}</span>
                    </div>
                    <Progress value={progressToNextLevel} className="mb-2 h-2" />
                    <p className="text-xs text-muted-foreground">{xpToNextLevel} XP to level {userStats.level + 1}</p>
                  </CardContent>
                </Card>

                <StreakWidget streak={userStats.streak} userId={authUser.id} />

                <Card className="rounded-2xl border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="heading-font">Courses in Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {coursesInProgress.length > 0 ? (
                      <div className="space-y-3">
                        {coursesInProgress.map((course) => (
                          <div key={course.id} className="flex items-center gap-3 rounded-xl bg-sidebar p-2">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                              {course.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="mb-1 font-semibold text-foreground">{course.title}</h4>
                              <div className="flex items-center gap-2">
                                <Progress value={course.progress} className="h-2 flex-1" />
                                <span className="text-sm font-medium text-primary">{course.progress}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-muted-foreground">No courses in progress. Start learning today!</p>
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
                        {userStats.achievements.slice(0, 6).map((achievementId: string) => {
                          const achievementTitles: Record<string, string> = {
                            first_blood: 'First Blood',
                            night_owl: 'Night Owl',
                            hint_abuser: 'Desperate Times',
                            on_fire: 'On Fire',
                            unstoppable: 'Unstoppable',
                            wealthy: 'Deep Pockets'
                          };
                          return (
                            <Badge key={achievementId} className="bg-gradient-to-br from-accent to-primary text-white px-4 py-2">
                              <LuTrophy className="w-4 h-4 mr-2" />
                              {achievementTitles[achievementId] || 'Achievement'}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}





