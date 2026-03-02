export interface Instructor {
  id: string;
  fullName: string;
  email: string;
  hubIds: string[];
}

export interface Hub {
  id: string;
  name: string;
  city: string;
  cohort: string;
  capacity: number;
  instructorIds: string[];
}

export interface StudentProgress {
  completedLessons: number;
  totalLessons: number;
  completedProjects: number;
  totalProjects: number;
  xp: number;
}

export type StudentRiskLevel = 'on-track' | 'needs-attention' | 'at-risk';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  hubId: string;
  cohort: string;
  riskLevel: StudentRiskLevel;
  progress: StudentProgress;
  achievementIds: string[];
}

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Learning' | 'Projects' | 'Consistency' | 'Community';
  tier: AchievementTier;
  points: number;
}

export interface HubSummary {
  hub: Hub;
  studentCount: number;
  averageProgress: number;
  completionRate: number;
}

export interface DashboardMetrics {
  totalHubs: number;
  totalStudents: number;
  averageProgress: number;
  studentsAtRisk: number;
}
