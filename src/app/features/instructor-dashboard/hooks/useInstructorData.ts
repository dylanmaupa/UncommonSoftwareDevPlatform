import { useMemo } from 'react';
import { achievements, hubs, students } from '../data';
import {
  buildDashboardMetrics,
  calculateHubSummary,
  calculateProgressPercentage,
  getAchievementMap,
  getStudentsForHub,
  toStudentChartData,
} from '../data/selectors';
import type { Achievement, HubSummary, Student } from '../types/instructor.types';

export function useInstructorData() {
  const allHubs = hubs;
  const allStudents = students;
  const achievementMap = useMemo(() => getAchievementMap(achievements), []);

  const hubSummaries = useMemo<HubSummary[]>(() => {
    return allHubs.map((hub) => {
      const studentsForHub = getStudentsForHub(allStudents, hub.id);
      return calculateHubSummary(hub, studentsForHub);
    });
  }, [allHubs, allStudents]);

  const metrics = useMemo(() => {
    return buildDashboardMetrics(allHubs, allStudents);
  }, [allHubs, allStudents]);

  const topStudents = useMemo(() => {
    return [...allStudents]
      .sort((a, b) => calculateProgressPercentage(b.progress) - calculateProgressPercentage(a.progress))
      .slice(0, 5);
  }, [allStudents]);

  const chartData = useMemo(() => {
    return toStudentChartData(hubSummaries);
  }, [hubSummaries]);

  function getHubById(hubId: string) {
    return allHubs.find((h) => h.id === hubId);
  }

  function getStudentsByHubId(hubId: string) {
    return allStudents.filter((s) => s.hubId === hubId);
  }

  function getStudentById(studentId: string): Student | undefined {
    return allStudents.find((student) => student.id === studentId);
  }

  function getStudentAchievements(student: Student): Achievement[] {
    return student.achievementIds
      .map((achievementId) => achievementMap[achievementId])
      .filter((achievement): achievement is Achievement => Boolean(achievement));
  }

  return {
    allHubs,
    allStudents,
    hubSummaries,
    metrics,
    topStudents,
    chartData,
    getHubById,
    getStudentsByHubId,
    getStudentById,
    getStudentAchievements,
  };
}
