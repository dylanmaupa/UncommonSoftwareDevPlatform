import { useMemo } from 'react';
import { achievements, hubs, instructor, students } from '../data';
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
  const instructorHubs = useMemo(() => {
    return hubs.filter((hub) => instructor.hubIds.includes(hub.id));
  }, []);

  const instructorStudents = useMemo(() => {
    const hubIdSet = new Set(instructorHubs.map((hub) => hub.id));
    return students.filter((student) => hubIdSet.has(student.hubId));
  }, [instructorHubs]);

  const achievementMap = useMemo(() => getAchievementMap(achievements), []);

  const hubSummaries = useMemo<HubSummary[]>(() => {
    return instructorHubs.map((hub) => {
      const studentsForHub = getStudentsForHub(instructorStudents, hub.id);
      return calculateHubSummary(hub, studentsForHub);
    });
  }, [instructorHubs, instructorStudents]);

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
    instructorHubs,
    instructorStudents,
    hubSummaries,
    metrics,
    topStudents,
    chartData,
    getStudentById,
    getStudentAchievements,
  };
}

