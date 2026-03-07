import achievementsJson from './achievements.json';
import hubsJson from './hubs.json';
import instructorJson from './instructor.json';
import studentsJson from './students.json';
import type { Achievement, Hub, Instructor, Student } from '../types/instructor.types';

export const instructor = instructorJson as Instructor;
export const hubs = hubsJson as Hub[];
export const students = studentsJson as Student[];
export const achievements = achievementsJson as Achievement[];
