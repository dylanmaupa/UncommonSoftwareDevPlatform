import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  LuActivity, 
  LuTrendingUp,
  LuTrendingDown,
  LuUsers,
  LuBookOpen,
  LuTarget,
  LuClock,
  LuCalendar,
  LuDownload
} from 'react-icons/lu';

interface AnalyticsData {
  studentMetrics: {
    totalStudents: number;
    activeStudents: number;
    completionRate: number;
    avgProgress: number;
  };
  exerciseMetrics: {
    totalExercises: number;
    avgDifficulty: number;
    mostAttempted: string;
    highestSuccess: string;
  };
  timeMetrics: {
    avgTimePerExercise: string;
    peakActivityHour: string;
    mostActiveDay: string;
  };
  weeklyData: {
    day: string;
    submissions: number;
    completions: number;
  }[];
}

const mockAnalytics: AnalyticsData = {
  studentMetrics: {
    totalStudents: 120,
    activeStudents: 87,
    completionRate: 73,
    avgProgress: 68
  },
  exerciseMetrics: {
    totalExercises: 45,
    avgDifficulty: 2.4,
    mostAttempted: 'React Hooks Challenge',
    highestSuccess: 'HTML Basics Quiz'
  },
  timeMetrics: {
    avgTimePerExercise: '2h 15m',
    peakActivityHour: '2:00 PM',
    mostActiveDay: 'Tuesday'
  },
  weeklyData: [
    { day: 'Mon', submissions: 12, completions: 8 },
    { day: 'Tue', submissions: 18, completions: 14 },
    { day: 'Wed', submissions: 15, completions: 11 },
    { day: 'Thu', submissions: 20, completions: 16 },
    { day: 'Fri', submissions: 14, completions: 10 },
    { day: 'Sat', submissions: 8, completions: 6 },
    { day: 'Sun', submissions: 6, completions: 4 },
  ]
};

const exerciseDifficultyData = [
  { name: 'JavaScript Basics', difficulty: 1.5, completionRate: 92 },
  { name: 'React Fundamentals', difficulty: 2.8, completionRate: 78 },
  { name: 'State Management', difficulty: 3.2, completionRate: 65 },
  { name: 'API Integration', difficulty: 2.5, completionRate: 81 },
  { name: 'Testing', difficulty: 3.5, completionRate: 58 },
];

const studentPerformanceTiers = [
  { tier: 'Excellence (90-100%)', count: 18, color: 'bg-emerald-500' },
  { tier: 'Proficient (70-89%)', count: 42, color: 'bg-blue-500' },
  { tier: 'Developing (50-69%)', count: 35, color: 'bg-amber-500' },
  { tier: 'Needs Support (<50%)', count: 25, color: 'bg-rose-500' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Analytics</h1>
          <p className="text-slate-500 mt-1">Data-driven insights to improve teaching outcomes</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value)}
            className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" className="rounded-full border-blue-200">
            <LuDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Completion Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-slate-900">{mockAnalytics.studentMetrics.completionRate}%</p>
                  <span className="text-xs text-emerald-600 flex items-center">
                    <LuTrendingUp className="h-3 w-3 mr-0.5" /> +5%
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuTarget className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider">Active Students</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-slate-900">{mockAnalytics.studentMetrics.activeStudents}</p>
                  <span className="text-xs text-emerald-600 flex items-center">
                    <LuTrendingUp className="h-3 w-3 mr-0.5" /> +12
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <LuUsers className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-600/70 uppercase tracking-wider">Avg Progress</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-slate-900">{mockAnalytics.studentMetrics.avgProgress}%</p>
                  <span className="text-xs text-slate-400">of course</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <LuActivity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600/70 uppercase tracking-wider">Time per Exercise</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-slate-900">{mockAnalytics.timeMetrics.avgTimePerExercise}</p>
                  <span className="text-xs text-rose-600 flex items-center">
                    <LuTrendingDown className="h-3 w-3 mr-0.5" /> -15m
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <LuClock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Weekly Activity</CardTitle>
            <CardDescription>Submissions and completions over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {mockAnalytics.weeklyData.map((day, index) => {
                const maxValue = Math.max(...mockAnalytics.weeklyData.map(d => Math.max(d.submissions, d.completions)));
                const submissionHeight = (day.submissions / maxValue) * 100;
                const completionHeight = (day.completions / maxValue) * 100;
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 justify-center" style={{ height: '200px' }}>
                      <div 
                        className="w-3 bg-blue-300 rounded-t"
                        style={{ height: `${submissionHeight}%` }}
                        title={`${day.submissions} submissions`}
                      />
                      <div 
                        className="w-3 bg-blue-600 rounded-t"
                        style={{ height: `${completionHeight}%` }}
                        title={`${day.completions} completions`}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{day.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-300 rounded" />
                <span className="text-sm text-slate-600">Submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded" />
                <span className="text-sm text-slate-600">Completions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Performance Distribution */}
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Student Performance</CardTitle>
            <CardDescription>Distribution across performance tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentPerformanceTiers.map((tier) => (
                <div key={tier.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{tier.tier}</span>
                    <span className="text-sm font-medium text-slate-900">{tier.count} students</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${tier.color} transition-all duration-500`}
                      style={{ width: `${(tier.count / 120) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">Insight:</span> 25 students need additional support. 
                Consider scheduling office hours or creating supplementary materials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Analytics */}
      <Card className="rounded-2xl border-blue-200/60 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Exercise Performance</CardTitle>
          <CardDescription>Difficulty vs completion rate by topic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium text-left">Topic</th>
                  <th className="px-4 py-3 font-medium text-left">Difficulty Score</th>
                  <th className="px-4 py-3 font-medium text-left">Completion Rate</th>
                  <th className="px-4 py-3 font-medium text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {exerciseDifficultyData.map((exercise) => (
                  <tr key={exercise.name} className="border-b border-slate-50 last:border-b-0">
                    <td className="px-4 py-4 font-medium text-sm text-slate-900">{exercise.name}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(exercise.difficulty / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{exercise.difficulty}/4</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              exercise.completionRate >= 80 ? 'bg-emerald-500' :
                              exercise.completionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${exercise.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{exercise.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {exercise.completionRate < 60 ? (
                        <Badge className="bg-rose-100 text-rose-700 rounded-full">Needs Review</Badge>
                      ) : exercise.completionRate < 80 ? (
                        <Badge className="bg-amber-100 text-amber-700 rounded-full">Moderate</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 rounded-full">Good</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-blue-200/60 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <LuBookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Most Attempted</p>
                <p className="text-sm text-slate-600">{mockAnalytics.exerciseMetrics.mostAttempted}</p>
                <p className="text-xs text-slate-500 mt-1">High student engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <LuTrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Highest Success Rate</p>
                <p className="text-sm text-slate-600">{mockAnalytics.exerciseMetrics.highestSuccess}</p>
                <p className="text-xs text-slate-500 mt-1">92% completion rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <LuCalendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Peak Activity</p>
                <p className="text-sm text-slate-600">{mockAnalytics.timeMetrics.mostActiveDay}s at {mockAnalytics.timeMetrics.peakActivityHour}</p>
                <p className="text-xs text-slate-500 mt-1">Best time for announcements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
