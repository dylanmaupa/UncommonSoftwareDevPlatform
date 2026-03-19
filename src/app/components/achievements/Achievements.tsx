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
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await fetchProfileForAuthUser(user as any);

      if (profile) {
        setUserProfile(profile);
      }

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressData) {
        setUserProgress(progressData);
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

  const currentLevel = calculateUserLevel(userProfile.xp);
  const nextLevel = currentLevel + 1;
  const levelProgress = calculateUserLevel(userProfile.xp) === 1 ? userProfile.xp || 0 : ((userProfile.xp || 0) % 100);

  // Group user progress by the last 5 days
  const levelBars = (() => {
    const buckets = [0, 0, 0, 0, 0];
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;

    const completedProgress = userProgress?.filter((p: any) => p.status === 'completed' && p.updated_at) || [];

    completedProgress.forEach((p: any) => {
      const updatedDate = new Date(p.updated_at);
      const diffDays = Math.floor((now.getTime() - updatedDate.getTime()) / msPerDay);
      
      // We are checking the last 5 days (Day 0 to Day 4)
      if (diffDays >= 0 && diffDays < 5) {
        // Map 0 to bucket 4 (newest), 1 to bucket 3, ..., 4 to bucket 0 (oldest)
        const bucketIndex = 4 - diffDays;
        if (bucketIndex >= 0 && bucketIndex < 5) {
          buckets[bucketIndex]++;
        }
      }
    });

    return buckets.map((count, i) => {
      if (count === 0) return { height: 'h-0', opacity: 'bg-transparent' }; // No lessons taken on this day
      
      const startThreshold = i * 20;
      const endThreshold = (i + 1) * 20;

      // Cap the height based on how much XP they actually have for this 20-point bracket
      let maxHeightClass = 'h-14';
      let maxOpacity = 'bg-primary';

      if (levelProgress <= startThreshold) {
        return { height: 'h-2', opacity: 'bg-primary/20' }; 
      } else if (levelProgress < endThreshold) {
        const fraction = (levelProgress - startThreshold) / 20;
        if (fraction <= 0.2) maxHeightClass = 'h-6';
        else if (fraction <= 0.5) maxHeightClass = 'h-8';
        else if (fraction <= 0.8) maxHeightClass = 'h-12';
        maxOpacity = 'bg-primary/80';
      }

      // Constrain by effort: 1 lesson = partial height, 2+ = max allowable XP height
      if (count === 1) {
        // Scale down slightly if only 1 lesson was done, but never below h-4 if active
        const actualHeight = maxHeightClass === 'h-14' ? 'h-10' : 'h-6';
        return { height: actualHeight, opacity: 'bg-primary/70' };
      }

      return { height: maxHeightClass, opacity: maxOpacity };
    });
  })();

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
                  <div className="mb-3 flex items-end gap-2 h-14">
                    {levelBars.map((bar, i) => (
                      <div key={i} className={`w-8 rounded-md ${bar.height} ${bar.opacity} transition-all duration-300`} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Level {currentLevel}</span>
                    <span>Level {nextLevel}</span>
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
