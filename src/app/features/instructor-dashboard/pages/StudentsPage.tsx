import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Input } from '../../../components/ui/input';
import { 
  LuUsers, 
  LuSearch, 
  LuFilter,
  LuMail,
  LuTrendingUp,
  LuBookOpen,
  LuClock,
  LuChevronRight,
  LuChartColumn,
  LuCircleCheck,
  LuCircleAlert,
  LuX,
  LuEllipsis,
  LuFile,
  LuActivity
} from 'react-icons/lu';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress: number;
  exercisesCompleted: number;
  totalExercises: number;
  lastActive: string;
  status: 'active' | 'stuck' | 'inactive' | 'completed';
  hub: string;
  joinDate: string;
  weakTopics: string[];
  strengths: string[];
  timeSpent: string;
}

const mockStudents: Student[] = [
  { 
    id: '1', 
    name: 'John Anderson', 
    email: 'john.anderson@example.com', 
    progress: 78, 
    exercisesCompleted: 34, 
    totalExercises: 45,
    lastActive: '2 hours ago', 
    status: 'active',
    hub: 'Harare Cohort',
    joinDate: '2024-01-15',
    weakTopics: ['Async Programming', 'Error Handling'],
    strengths: ['React Basics', 'CSS Layout'],
    timeSpent: '45 hours'
  },
  { 
    id: '2', 
    name: 'Sarah Mitchell', 
    email: 'sarah.mitchell@example.com', 
    progress: 92, 
    exercisesCompleted: 42, 
    totalExercises: 45,
    lastActive: '30 minutes ago', 
    status: 'active',
    hub: 'Harare Cohort',
    joinDate: '2024-01-10',
    weakTopics: ['Performance Optimization'],
    strengths: ['State Management', 'Testing'],
    timeSpent: '62 hours'
  },
  { 
    id: '3', 
    name: 'Michael Chen', 
    email: 'michael.chen@example.com', 
    progress: 45, 
    exercisesCompleted: 18, 
    totalExercises: 45,
    lastActive: '4 days ago', 
    status: 'stuck',
    hub: 'Harare Cohort',
    joinDate: '2024-02-01',
    weakTopics: ['Hooks', 'Context API', 'Forms'],
    strengths: ['HTML Basics'],
    timeSpent: '28 hours'
  },
  { 
    id: '4', 
    name: 'Emily Rodriguez', 
    email: 'emily.rodriguez@example.com', 
    progress: 63, 
    exercisesCompleted: 28, 
    totalExercises: 45,
    lastActive: '1 day ago', 
    status: 'active',
    hub: 'Harare Cohort',
    joinDate: '2024-01-20',
    weakTopics: ['TypeScript', 'API Integration'],
    strengths: ['Component Design', 'CSS Animations'],
    timeSpent: '38 hours'
  },
  { 
    id: '5', 
    name: 'David Kim', 
    email: 'david.kim@example.com', 
    progress: 23, 
    exercisesCompleted: 10, 
    totalExercises: 45,
    lastActive: '7 days ago', 
    status: 'inactive',
    hub: 'Harare Cohort',
    joinDate: '2024-03-01',
    weakTopics: ['JavaScript Basics', 'DOM Manipulation', 'Events'],
    strengths: [],
    timeSpent: '12 hours'
  },
  { 
    id: '6', 
    name: 'Lisa Thompson', 
    email: 'lisa.thompson@example.com', 
    progress: 100, 
    exercisesCompleted: 45, 
    totalExercises: 45,
    lastActive: '1 hour ago', 
    status: 'completed',
    hub: 'Harare Cohort',
    joinDate: '2024-01-05',
    weakTopics: [],
    strengths: ['All Topics'],
    timeSpent: '78 hours'
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full">Active</Badge>;
      case 'stuck':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full">Stuck</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full">Inactive</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full">Completed</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
          <p className="text-slate-500 mt-1">Track learner outcomes and monitor progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-700 rounded-full px-3 py-1">
            <LuUsers className="h-3 w-3 mr-1" />
            {students.length} Students
          </Badge>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="rounded-2xl border-blue-200/60 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <LuFilter className="h-4 w-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="stuck">Stuck</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <Card className="rounded-2xl border-blue-200/60 bg-white lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Student Directory</CardTitle>
            <CardDescription>All students in your hub</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500 bg-slate-50/50">
                    <th className="px-4 py-3 font-medium text-left">Student</th>
                    <th className="px-4 py-3 font-medium text-left">Progress</th>
                    <th className="px-4 py-3 font-medium text-left">Completed</th>
                    <th className="px-4 py-3 font-medium text-left">Last Active</th>
                    <th className="px-4 py-3 font-medium text-left">Status</th>
                    <th className="px-4 py-3 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className={`border-b border-slate-50 last:border-b-0 hover:bg-blue-50/30 transition-colors cursor-pointer ${
                        selectedStudent?.id === student.id ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(student.progress)}`} 
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {student.exercisesCompleted}/{student.totalExercises}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <LuClock className="h-3 w-3" />
                          {student.lastActive}
                        </div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(student.status)}</td>
                      <td className="px-4 py-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="rounded-full h-8 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <LuUsers className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No students found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Profile Sidebar */}
        <div className="space-y-6">
          {selectedStudent ? (
            <>
              <Card className="rounded-2xl border-blue-200/60 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedStudent.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-medium">
                          {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{selectedStudent.name}</h3>
                        <p className="text-sm text-slate-500">{selectedStudent.email}</p>
                        {getStatusBadge(selectedStudent.status)}
                      </div>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => setSelectedStudent(null)}
                    >
                      <LuX className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                      <p className="text-xs text-blue-600/70 uppercase">Progress</p>
                      <p className="text-xl font-bold text-blue-700">{selectedStudent.progress}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                      <p className="text-xs text-blue-600/70 uppercase">Exercises</p>
                      <p className="text-xl font-bold text-blue-700">{selectedStudent.exercisesCompleted}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                      <p className="text-xs text-blue-600/70 uppercase">Time Spent</p>
                      <p className="text-xl font-bold text-blue-700">{selectedStudent.timeSpent}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                      <p className="text-xs text-blue-600/70 uppercase">Joined</p>
                      <p className="text-xl font-bold text-blue-700">{new Date(selectedStudent.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-slate-900 mb-2 flex items-center gap-2">
                        <LuTrendingUp className="h-4 w-4 text-emerald-500" />
                        Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.strengths.length > 0 ? selectedStudent.strengths.map((strength, i) => (
                          <Badge key={i} className="bg-emerald-100 text-emerald-700 rounded-full">{strength}</Badge>
                        )) : (
                          <span className="text-sm text-slate-500">No strengths recorded yet</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-slate-900 mb-2 flex items-center gap-2">
                        <LuCircleAlert className="h-4 w-4 text-amber-500" />
                        Areas for Improvement
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.weakTopics.length > 0 ? selectedStudent.weakTopics.map((topic, i) => (
                          <Badge key={i} className="bg-amber-100 text-amber-700 rounded-full">{topic}</Badge>
                        )) : (
                          <span className="text-sm text-slate-500">No weak areas identified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700">
                      <LuMail className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-full border-blue-200">
                      <LuFile className="mr-2 h-4 w-4" />
                      Submissions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="rounded-2xl border-blue-200/60 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <LuCircleCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Exercise Completed</p>
                        <p className="text-xs text-slate-500">React Hooks Challenge</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">2h ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                        <LuBookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Lesson Viewed</p>
                        <p className="text-xs text-slate-500">Advanced State Management</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">5h ago</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="rounded-2xl border-blue-200/60 bg-white">
              <CardContent className="p-8 text-center">
                <LuUsers className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">Select a student to view their profile</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
