import { useEffect, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { achievementsData, authService } from '../../services/mockData';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { LuFlame, LuLock, LuSparkles, LuTarget, LuTrophy } from 'react-icons/lu';
import { supabase } from '../../../lib/supabase';
import { calculateUserLevel } from '../../../lib/gamificationUtils';
import { fetchProfileForAuthUser } from '../../lib/profileAccess';

export default function Achievements() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await fetchProfileForAuthUser(user as any);

      if (profile) {
        setUserProfile(profile);
      }
      setIsLoading(false);
    }
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Loading achievements...</div>
      </DashboardLayout>
    );
  }

  if (!userProfile) return null;

  const userAchievements: string[] = userProfile.achievements || [];

  const unlockedAchievements = achievementsData.map((achievement) => ({
    ...achievement,
    unlocked: userAchievements.includes(achievement.id),
  }));

  const unlockedCount = unlockedAchievements.filter((achievement) => achievement.unlocked).length;
  const totalCount = achievementsData.length;
  const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const lockedAchievements = unlockedAchievements.filter((achievement) => !achievement.unlocked);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
          <div className="space-y-4">
            <Card className="overflow-hidden rounded-2xl border-border bg-primary">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-wider text-white/80">Achievements Overview</p>
                <h1 className="mt-2 text-3xl leading-tight text-white heading-font">Track your milestones and keep leveling up</h1>
                <p className="mt-2 text-sm text-white/80">
                  Unlock achievements by completing lessons, projects, and daily streak goals.
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white" style={{ width: `${completionRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-white/80">{completionRate}% completed</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Card className="rounded-2xl border-border bg-sidebar">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Unlocked</p>
                    <p className="text-sm text-foreground">
                      {unlockedCount}/{totalCount} badges
                    </p>
                  </div>
                  <LuTrophy className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border bg-sidebar">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                    <p className="text-sm text-foreground">{userProfile.xp || 0} points</p>
                  </div>
                  <LuSparkles className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-border bg-sidebar">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Level</p>
                    <p className="text-sm text-foreground">Level {calculateUserLevel(userProfile.xp)}</p>
                  </div>
                  <LuTarget className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-border">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="text-lg text-foreground heading-font">All Achievements</h2>
                  <p className="text-xs text-muted-foreground">{unlockedCount} unlocked</p>
                </div>
                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                  {unlockedAchievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`rounded-2xl border-border ${achievement.unlocked ? 'bg-sidebar' : 'bg-card'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl ${achievement.unlocked ? 'bg-primary/15 text-primary' : 'bg-secondary'
                              }`}
                          >
                            {achievement.unlocked ? achievement.icon : <LuLock className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <h3 className={`text-base heading-font ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {achievement.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  achievement.unlocked
                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground'
                                }
                              >
                                {achievement.unlocked ? 'Unlocked' : 'Locked'}
                              </Badge>
                            </div>
                            <p className={`text-xs ${achievement.unlocked ? 'text-muted-foreground' : 'text-muted-foreground/80'}`}>
                              {achievement.description}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">{achievement.condition}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardContent className="space-y-3 p-4">
                <h3 className="text-base text-foreground heading-font">Progress Snapshot</h3>
                <div className="rounded-2xl bg-secondary p-3">
                  <div className="mb-3 flex items-end gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/30" />
                    <div className="h-10 w-8 rounded-md bg-primary/55" />
                    <div className="h-12 w-8 rounded-md bg-primary/80" />
                    <div className="h-14 w-8 rounded-md bg-primary" />
                    <div className="h-9 w-8 rounded-md bg-primary/40" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Locked {totalCount - unlockedCount}</span>
                    <span>Unlocked {unlockedCount}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Rate: {completionRate}%</div>
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Level: {calculateUserLevel(userProfile.xp)}</div>
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">XP: {userProfile.xp || 0}</div>
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Streak: {userProfile.streak || 0}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base text-foreground heading-font">Next Targets</h3>
                  <LuFlame className="h-4 w-4 text-muted-foreground" />
                </div>
                {lockedAchievements.length > 0 ? (
                  lockedAchievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="rounded-xl bg-sidebar p-3">
                      <p className="text-sm text-foreground">{achievement.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{achievement.condition}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-sidebar p-3">
                    <p className="text-sm text-foreground">All achievements unlocked.</p>
                    <p className="mt-1 text-xs text-muted-foreground">You have completed every available badge.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
