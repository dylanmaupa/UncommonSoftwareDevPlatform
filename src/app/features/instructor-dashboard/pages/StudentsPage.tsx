import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Progress } from '../../../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import DataTable, { type DataTableColumn } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';
import type { Student } from '../types/instructor.types';

export default function StudentsPage() {
  const { instructorStudents, instructorHubs } = useInstructorData();
  const [selectedHubId, setSelectedHubId] = useState<string>('all');

  const hubNameById = useMemo(() => {
    return instructorHubs.reduce<Record<string, string>>((acc, hub) => {
      acc[hub.id] = hub.name;
      return acc;
    }, {});
  }, [instructorHubs]);

  const visibleStudents = useMemo(() => {
    if (selectedHubId === 'all') return instructorStudents;
    return instructorStudents.filter((student) => student.hubId === selectedHubId);
  }, [instructorStudents, selectedHubId]);

  const columns: Array<DataTableColumn<Student>> = [
    {
      key: 'student',
      header: 'Student',
      render: (student) => (
        <div className="flex items-center gap-3">
          <img src={student.avatarUrl} alt={student.fullName} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="font-medium text-foreground">{student.fullName}</p>
            <p className="text-xs text-muted-foreground">{student.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'hub',
      header: 'Hub',
      render: (student) => <span className="text-sm text-foreground">{hubNameById[student.hubId] ?? student.hubId}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (student) => <StatusBadge riskLevel={student.riskLevel} />,
    },
    {
      key: 'progress',
      header: 'Progress',
      className: 'min-w-36',
      render: (student) => {
        const progress = calculateProgressPercentage(student.progress);

        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Lessons</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (student) => (
        <Link
          to={`/instructor/students/${student.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Open Profile
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-semibold text-foreground">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">Learner progress, risk level, and individual profile access.</p>
      </header>

      <section className="max-w-sm">
        <Select value={selectedHubId} onValueChange={setSelectedHubId}>
          <SelectTrigger className="h-10 rounded-xl bg-card">
            <SelectValue placeholder="Filter by hub" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All hubs</SelectItem>
            {instructorHubs.map((hub) => (
              <SelectItem key={hub.id} value={hub.id}>
                {hub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section>
        <DataTable
          data={visibleStudents}
          columns={columns}
          keyExtractor={(student) => student.id}
          emptyMessage="No students found for this hub filter."
          caption="Student roster for assigned hubs"
        />
      </section>
    </div>
  );
}
