import { createContext, useContext, useMemo } from 'react';
import { achievements, hubs, instructor as defaultInstructor, students } from '../data';
import {
  buildDashboardMetrics,
  calculateHubSummary,
  calculateProgressPercentage,
  getAchievementMap,
  getStudentsForHub,
  toStudentChartData,
} from '../data/selectors';
import type { Achievement, HubSummary, Student } from '../types/instructor.types';

export function useComputeInstructorData(hubLocationName?: string, fullName?: string, email?: string) {
  const instructorHubId = useMemo(() => {
    if (hubLocationName) {
      const hub = hubs.find((h) => h.name.toLowerCase() === hubLocationName.toLowerCase() || h.id === hubLocationName);
      if (hub) return hub.id;
    }
    return defaultInstructor.hubId || defaultInstructor.hubIds?.[0] || '';
  }, [hubLocationName]);

  const instructor = useMemo(() => {
    return {
      id: defaultInstructor.id,
      fullName: fullName || defaultInstructor.fullName,
      email: email || defaultInstructor.email,
      hubId: instructorHubId,
    };
  }, [fullName, email, instructorHubId]);

  const instructorHub = useMemo(() => {
    return hubs.find((hub) => hub.id === instructorHubId) ?? null;
  }, [instructorHubId]);

  const instructorHubs = useMemo(() => {
    return instructorHub ? [instructorHub] : [];
  }, [instructorHub]);

  const instructorStudents = useMemo(() => {
    if (!instructorHubId) return [];
    return students.filter((student) => student.hubId === instructorHubId);
  }, [instructorHubId]);

  const achievementMap = useMemo(() => getAchievementMap(achievements), []);

  const hubSummaries = useMemo<HubSummary[]>(() => {
    if (!instructorHub) return [];
    const studentsForHub = getStudentsForHub(instructorStudents, instructorHub.id);
    return [calculateHubSummary(instructorHub, studentsForHub)];
  }, [instructorHub, instructorStudents]);

  const hubSummary = hubSummaries[0] ?? null;

  const metrics = useMemo(() => {
    return buildDashboardMetrics(instructorHubs, instructorStudents);
  }, [instructorHubs, instructorStudents]);

  const topStudents = useMemo(() => {
    return [...instructorStudents]
      .sort((a, b) => calculateProgressPercentage(b.progress) - calculateProgressPercentage(a.progress))
      .slice(0, 5);
  }, [instructorStudents]);

  const chartData = useMemo(() => {
    return toStudentChartData(hubSummaries);
  }, [hubSummaries]);

  function getStudentById(studentId: string): Student | undefined {
    return instructorStudents.find((student) => student.id === studentId);
  }

  function getStudentAchievements(student: Student): Achievement[] {
    return student.achievementIds
      .map((achievementId) => achievementMap[achievementId])
      .filter((achievement): achievement is Achievement => Boolean(achievement));
  }

  return {
    instructor,
    instructorHub,
    instructorHubId,
    instructorHubs,
    instructorStudents,
    hubSummaries,
    hubSummary,
    metrics,
    topStudents,
    chartData,
    getStudentById,
    getStudentAchievements,
  };
}

export type InstructorContextType = ReturnType<typeof useComputeInstructorData>;

export const InstructorContext = createContext<InstructorContextType | null>(null);

export function useInstructorData() {
  const context = useContext(InstructorContext);
  if (!context) {
    throw new Error('useInstructorData must be used within an InstructorContext.Provider');
  }
  return context;
}
