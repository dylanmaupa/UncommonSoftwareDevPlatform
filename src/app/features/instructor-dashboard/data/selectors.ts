import type {
  Achievement,
  DashboardMetrics,
  Hub,
  HubSummary,
  Student,
  StudentProgress,
} from '../types/instructor.types';

export function calculateProgressPercentage(progress: StudentProgress): number {
  if (progress.totalLessons === 0) return 0;
  return Math.round((progress.completedLessons / progress.totalLessons) * 100);
}

export function calculateProjectPercentage(progress: StudentProgress): number {
  if (progress.totalProjects === 0) return 0;
  return Math.round((progress.completedProjects / progress.totalProjects) * 100);
}

export function getStudentsForHub(students: Student[], hubId: string): Student[] {
  return students.filter((student) => student.hubId === hubId);
}

export function calculateHubSummary(hub: Hub, studentsForHub: Student[]): HubSummary {
  const averageProgress = calculateAverageProgress(studentsForHub);
  const completionRate = calculateCompletionRate(studentsForHub);

  return {
    hub,
    studentCount: studentsForHub.length,
    averageProgress,
    completionRate,
  };
}

export function calculateAverageProgress(students: Student[]): number {
  if (students.length === 0) return 0;

  const total = students.reduce((sum, student) => {
    return sum + calculateProgressPercentage(student.progress);
  }, 0);

  return Math.round(total / students.length);
}

export function calculateCompletionRate(students: Student[]): number {
  if (students.length === 0) return 0;

  const completed = students.filter((student) => {
    return student.progress.completedLessons >= student.progress.totalLessons;
  }).length;

  return Math.round((completed / students.length) * 100);
}

export function buildDashboardMetrics(hubs: Hub[], students: Student[]): DashboardMetrics {
  return {
    totalHubs: hubs.length,
    totalStudents: students.length,
    averageProgress: calculateAverageProgress(students),
    studentsAtRisk: students.filter((student) => student.riskLevel === 'at-risk').length,
  };
}

export function getAchievementMap(achievements: Achievement[]): Record<string, Achievement> {
  return achievements.reduce<Record<string, Achievement>>((acc, achievement) => {
    acc[achievement.id] = achievement;
    return acc;
  }, {});
}

export function toStudentChartData(hubSummaries: HubSummary[]): Array<{ hubName: string; progress: number }> {
  return hubSummaries.map((summary) => ({
    hubName: summary.hub.name,
    progress: summary.averageProgress,
  }));
}
