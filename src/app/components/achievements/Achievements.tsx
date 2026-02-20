import DashboardLayout from '../layout/DashboardLayout';
import { achievementsData, authService } from '../../services/mockData';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { LuFlame, LuLock, LuSparkles, LuTarget, LuTrophy } from 'react-icons/lu';

export default function Achievements() {
  const user = authService.getCurrentUser();

  if (!user) return null;

  const unlockedAchievements = achievementsData.map((achievement) => ({
    ...achievement,
    unlocked: user.achievements.includes(achievement.id),
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
            <Card className="overflow-hidden rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#8B5CF6]">
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
              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-[#6B7280]">Unlocked</p>
                    <p className="text-sm text-[#1a1a2e]">
                      {unlockedCount}/{totalCount} badges
                    </p>
                  </div>
                  <LuTrophy className="h-4 w-4 text-[#6B7280]" />
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-[#6B7280]">Total XP</p>
                    <p className="text-sm text-[#1a1a2e]">{user.xp} points</p>
                  </div>
                  <LuSparkles className="h-4 w-4 text-[#6B7280]" />
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-[rgba(0,0,0,0.08)] bg-[#FAFAFA]">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-[#6B7280]">Current Level</p>
                    <p className="text-sm text-[#1a1a2e]">Level {user.level}</p>
                  </div>
                  <LuTarget className="h-4 w-4 text-[#6B7280]" />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] px-4 py-3">
                  <h2 className="text-lg text-[#1a1a2e] heading-font">All Achievements</h2>
                  <p className="text-xs text-[#6B7280]">{unlockedCount} unlocked</p>
                </div>
                <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                  {unlockedAchievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`rounded-2xl border-[rgba(0,0,0,0.08)] ${achievement.unlocked ? 'bg-[#FAFAFA]' : 'bg-white'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl ${
                              achievement.unlocked ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' : 'bg-[#F5F5FA]'
                            }`}
                          >
                            {achievement.unlocked ? achievement.icon : <LuLock className="h-4 w-4 text-[#6B7280]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <h3 className={`text-base heading-font ${achievement.unlocked ? 'text-[#1a1a2e]' : 'text-[#6B7280]'}`}>
                                {achievement.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  achievement.unlocked
                                    ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]'
                                    : 'border-[rgba(0,0,0,0.12)] text-[#6B7280]'
                                }
                              >
                                {achievement.unlocked ? 'Unlocked' : 'Locked'}
                              </Badge>
                            </div>
                            <p className={`text-xs ${achievement.unlocked ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
                              {achievement.description}
                            </p>
                            <p className="mt-2 text-xs text-[#6B7280]">{achievement.condition}</p>
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
            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
              <CardContent className="space-y-3 p-4">
                <h3 className="text-base text-[#1a1a2e] heading-font">Progress Snapshot</h3>
                <div className="rounded-2xl bg-[#F5F5FA] p-3">
                  <div className="mb-3 flex items-end gap-2">
                    <div className="h-8 w-8 rounded-md bg-[#8B5CF6]/30" />
                    <div className="h-10 w-8 rounded-md bg-[#8B5CF6]/55" />
                    <div className="h-12 w-8 rounded-md bg-[#8B5CF6]/80" />
                    <div className="h-14 w-8 rounded-md bg-[#8B5CF6]" />
                    <div className="h-9 w-8 rounded-md bg-[#8B5CF6]/40" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                    <span>Locked {totalCount - unlockedCount}</span>
                    <span>Unlocked {unlockedCount}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">Rate: {completionRate}%</div>
                  <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">Level: {user.level}</div>
                  <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">XP: {user.xp}</div>
                  <div className="rounded-xl bg-[#FAFAFA] p-2 text-[#6B7280]">Streak: {user.streak}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base text-[#1a1a2e] heading-font">Next Targets</h3>
                  <LuFlame className="h-4 w-4 text-[#6B7280]" />
                </div>
                {lockedAchievements.length > 0 ? (
                  lockedAchievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="rounded-xl bg-[#FAFAFA] p-3">
                      <p className="text-sm text-[#1a1a2e]">{achievement.title}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">{achievement.condition}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-[#FAFAFA] p-3">
                    <p className="text-sm text-[#1a1a2e]">All achievements unlocked.</p>
                    <p className="mt-1 text-xs text-[#6B7280]">You have completed every available badge.</p>
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
