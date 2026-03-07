# Instructor Dashboard (Frontend Only) — Full Project Boilerplate

This project structure matches your existing student dashboard styling but extends it with clean, maintainable patterns for instructors.

Below is a *full, ready-to-paste scaffold* containing pages, components, hooks, types, and mock data.

Use this structure and copy files as needed into your existing project.

---

# 📁 Project Structure
```plaintext
src/
  instructor/
    components/
      layout/
        InstructorSidebar.tsx
        InstructorTopbar.tsx
      cards/
        StatCard.tsx
      tables/
        DataTable.tsx
    pages/
      InstructorDashboard.tsx
      InstructorHubs.tsx
      InstructorStudents.tsx
      InstructorStudentProfile.tsx
    data/
      instructors.json
      hubs.json
      students.json
      progress.json
    hooks/
      useInstructor.ts
      useHubs.ts
      useStudents.ts
    types/
      Instructor.ts
      Hub.ts
      Student.ts
      Progress.ts
```

---

# 📄 Types
## **types/Instructor.ts**
```ts
export interface Instructor {
  id: number;
  name: string;
  hubs: number[];
}
```

## **types/Hub.ts**
```ts
export interface Hub {
  id: number;
  name: string;
}
```

## **types/Student.ts**
```ts
export interface StudentCourseProgress {
  courseId: number;
  progress: number;
}

export interface Student {
  id: number;
  name: string;
  hubId: number;
  courses: StudentCourseProgress[];
  achievements: string[];
  lastActive: string;
}
```

## **types/Progress.ts**
```ts
export interface ProgressRecord {
  studentId: number;
  weeklyActivity: number[];
}
```

---

# 📄 Mock Data
## **data/instructors.json**
```json
[
  {
    "id": 1,
    "name": "Instructor A",
    "hubs": [1, 2]
  }
]
```

## **data/hubs.json**
```json
[
  { "id": 1, "name": "Harare Hub" },
  { "id": 2, "name": "Bulawayo Hub" }
]
```

## **data/students.json**
```json
[
  {
    "id": 1,
    "name": "John Moyo",
    "hubId": 1,
    "courses": [
      { "courseId": 1, "progress": 75 },
      { "courseId": 2, "progress": 40 }
    ],
    "achievements": ["Completed Module 1", "Top Performer"],
    "lastActive": "2026-03-01"
  }
]
```

## **data/progress.json**
```json
[
  {
    "studentId": 1,
    "weeklyActivity": [3, 4, 6, 7, 2, 1, 0]
  }
]
```

---

# 📄 Hooks
## **hooks/useInstructor.ts**
```ts
import instructors from "../data/instructors.json";
import { Instructor } from "../types/Instructor";

export const useInstructor = (): Instructor => {
  return instructors[0]; // Simulate logged-in instructor
};
```

## **hooks/useHubs.ts**
```ts
import hubs from "../data/hubs.json";
import { Hub } from "../types/Hub";
import { useInstructor } from "./useInstructor";

export const useHubs = (): Hub[] => {
  const instructor = useInstructor();
  return hubs.filter((hub) => instructor.hubs.includes(hub.id));
};
```

## **hooks/useStudents.ts**
```ts
import studentsData from "../data/students.json";
import { Student } from "../types/Student";

export const useStudents = (hubId?: number): Student[] => {
  if (!hubId) return studentsData;
  return studentsData.filter((s) => s.hubId === hubId);
};
```

---

# 📄 Layout Components
## **layout/InstructorSidebar.tsx**
```tsx
import { Link } from "react-router-dom";

export default function InstructorSidebar() {
  return (
    <aside className="w-64 h-screen bg-white shadow-md p-6 fixed">
      <h2 className="font-bold text-xl mb-6">Instructor</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/instructor/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/instructor/hubs" className="hover:text-blue-600">Hubs</Link>
        <Link to="/instructor/students" className="hover:text-blue-600">Students</Link>
      </nav>
    </aside>
  );
}
```

## **layout/InstructorTopbar.tsx**
```tsx
export default function InstructorTopbar() {
  return (
    <header className="w-full h-16 bg-white shadow flex items-center justify-end px-6">
      <p className="text-gray-700">Welcome, Instructor</p>
    </header>
  );
}
```

---

# 📄 Shared Components
## **cards/StatCard.tsx**
```tsx
interface Props {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: Props) {
  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
```

## **tables/DataTable.tsx**
```tsx
interface Column<T> {
  header: string;
  accessor: keyof T;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
}

export default function DataTable<T>({ data, columns }: Props<T>) {
  return (
    <table className="w-full text-left border">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th className="p-3" key={col.header}>{col.header}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b">
            {columns.map((col) => (
              <td className="p-3" key={String(col.accessor)}>
                {row[col.accessor] as any}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

# 📄 Pages
## **pages/InstructorDashboard.tsx**
```tsx
import StatCard from "../components/cards/StatCard";
import { useHubs } from "../hooks/useHubs";
import { useStudents } from "../hooks/useStudents";

export default function InstructorDashboard() {
  const hubs = useHubs();
  const students = useStudents();

  return (
    <div className="ml-64 p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Hubs" value={hubs.length} />
        <StatCard label="Total Students" value={students.length} />
      </div>
    </div>
  );
}
```

---

## **pages/InstructorHubs.tsx**
```tsx
import { useHubs } from "../hooks/useHubs";

export default function InstructorHubs() {
  const hubs = useHubs();

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">My Hubs</h1>

      <ul className="space-y-3">
        {hubs.map((hub) => (
          <li key={hub.id} className="p-4 bg-white shadow rounded-xl">
            {hub.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## **pages/InstructorStudents.tsx**
```tsx
import DataTable from "../components/tables/DataTable";
import { useStudents } from "../hooks/useStudents";

export default function InstructorStudents() {
  const students = useStudents();

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      <DataTable
        data={students}
        columns=[
          { header: "Name", accessor: "name" },
          { header: "Hub ID", accessor: "hubId" },
          { header: "Last Active", accessor: "lastActive" }
        ]
      />
    </div>
  );
}
```

---

## **pages/InstructorStudentProfile.tsx**
```tsx
import { useParams } from "react-router-dom";
import students from "../data/students.json";

export default function InstructorStudentProfile() {
  const { id } = useParams();
  const student = students.find((s) => s.id === Number(id));

  if (!student) return <p>Student not found</p>;

  return (
    <div className="ml-64 p-6 space-y-6">
      <h1 className="text-2xl font-bold">{student.name}</h1>

      <section className="bg-white p-6 shadow rounded-xl">
        <h2 className="font-semibold mb-2">Achievements</h2>
        <ul className="list-disc ml-6">
          {student.achievements.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

---

# ✔ Ready for next step
I can now:
✅ adapt colors to match your current student dashboard  
✅ merge it into your existing codebase structure  
✅ generate routing setup  

Tell me **which UI framework your student dashboard uses** (Tailwind? custom colors?), and I will match this design PERFECTLY.

