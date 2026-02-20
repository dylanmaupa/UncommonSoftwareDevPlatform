import DashboardLayout from '../layout/DashboardLayout';
import { achievementsData, authService } from '../../services/mockData';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Lock, Sparkles } from 'lucide-react';

export default function Achievements() {
  const user = authService.getCurrentUser();

  if (!user) return null;

  const unlockedAchievements = achievementsData.map(achievement => ({
    ...achievement,
    unlocked: user.achievements.includes(achievement.id),
  }));

  const unlockedCount = unlockedAchievements.filter(a => a.unlocked).length;
  const totalCount = achievementsData.length;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl lg:text-4xl heading-font" style={{ color: '#1a1a2e' }}>
              Achievements
            </h1>
            <Sparkles className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <p className="text-[#6B7280]">
            Unlock achievements by completing lessons and projects
          </p>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-[rgba(0,0,0,0.08)] bg-gradient-to-br from-[#0747a1] to-[#8B5CF6] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm mb-1">Unlocked</p>
                  <p className="text-4xl font-semibold heading-font">
                    {unlockedCount}/{totalCount}
                  </p>
                </div>
                <Trophy className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#6B7280] text-sm mb-1">Total XP</p>
                  <p className="text-4xl font-semibold heading-font" style={{ color: '#0747a1' }}>
                    {user.xp}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#0747a1]/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#0747a1]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[rgba(0,0,0,0.08)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#6B7280] text-sm mb-1">Current Level</p>
                  <p className="text-4xl font-semibold heading-font" style={{ color: '#8B5CF6' }}>
                    {user.level}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-2xl">
                  🎯
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Grid */}
        <div>
          <h2 className="text-2xl heading-font mb-6" style={{ color: '#1a1a2e' }}>
            All Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`border transition-all ${
                  achievement.unlocked
                    ? 'border-[#0747a1] bg-gradient-to-br from-[#0747a1]/5 to-[#8B5CF6]/5 shadow-lg'
                    : 'border-[rgba(0,0,0,0.08)] opacity-60'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-[#F59E0B] to-[#F97316] shadow-md'
                          : 'bg-[#F5F5FA]'
                      }`}
                    >
                      {achievement.unlocked ? (
                        achievement.icon
                      ) : (
                        <Lock className="w-6 h-6 text-[#6B7280]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3
                          className={`font-semibold heading-font ${
                            achievement.unlocked ? 'text-[#1a1a2e]' : 'text-[#6B7280]'
                          }`}
                        >
                          {achievement.title}
                        </h3>
                        {achievement.unlocked && (
                          <Badge className="bg-[#10B981] text-white flex-shrink-0">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-sm mb-3 ${
                          achievement.unlocked ? 'text-[#6B7280]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge
                          variant="outline"
                          className={
                            achievement.unlocked
                              ? 'border-[#0747a1] text-[#0747a1] bg-[#0747a1]/5'
                              : 'border-[#9CA3AF] text-[#9CA3AF]'
                          }
                        >
                          {achievement.condition}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        {unlockedCount < totalCount && (
          <Card className="mt-8 rounded-2xl border-[rgba(91,79,255,0.2)] bg-gradient-to-br from-[#0747a1]/5 to-[#8B5CF6]/5">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-[#0747a1] mx-auto mb-3" />
              <h3 className="text-xl font-semibold heading-font text-[#1a1a2e] mb-2">
                Keep Going!
              </h3>
              <p className="text-[#6B7280]">
                You have {totalCount - unlockedCount} more achievements to unlock. Complete
                lessons and projects to earn them all!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
