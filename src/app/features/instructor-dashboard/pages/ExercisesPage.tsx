import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  LuBookOpen, 
  LuSearch, 
  LuPlus,
  LuFilter,
  LuCode,
  LuFileQuestion,
  LuClipboardList,
  LuBug,
  LuClock,
  LuMoreHorizontal,
  LuEdit,
  LuTrash2,
  LuEye,
  LuCheckCircle,
  LuBarChart
} from 'react-icons/lu';

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'project' | 'debugging';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  module: string;
  deadline: string;
  xpReward: number;
  completions: number;
  averageScore: number;
  status: 'draft' | 'published' | 'archived';
}

const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'React Hooks Challenge',
    description: 'Build a custom hook for data fetching with loading and error states.',
    type: 'coding',
    difficulty: 'intermediate',
    module: 'React Fundamentals',
    deadline: '2024-03-15',
    xpReward: 150,
    completions: 45,
    averageScore: 78,
    status: 'published'
  },
  {
    id: '2',
    title: 'JavaScript Basics Quiz',
    description: 'Test your knowledge of variables, functions, and control flow.',
    type: 'quiz',
    difficulty: 'beginner',
    module: 'JavaScript Basics',
    deadline: '2024-03-10',
    xpReward: 50,
    completions: 89,
    averageScore: 85,
    status: 'published'
  },
  {
    id: '3',
    title: 'E-commerce Product Page',
    description: 'Build a complete product page with cart functionality.',
    type: 'project',
    difficulty: 'advanced',
    module: 'Advanced React',
    deadline: '2024-03-20',
    xpReward: 300,
    completions: 23,
    averageScore: 72,
    status: 'published'
  },
  {
    id: '4',
    title: 'Debug the React App',
    description: 'Find and fix 5 common React bugs in the provided codebase.',
    type: 'debugging',
    difficulty: 'intermediate',
    module: 'React Fundamentals',
    deadline: '2024-03-12',
    xpReward: 100,
    completions: 56,
    averageScore: 68,
    status: 'published'
  },
  {
    id: '5',
    title: 'Async Programming Practice',
    description: 'Master promises, async/await, and error handling.',
    type: 'coding',
    difficulty: 'advanced',
    module: 'JavaScript Advanced',
    deadline: '2024-03-25',
    xpReward: 200,
    completions: 0,
    averageScore: 0,
    status: 'draft'
  },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || exercise.type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return <LuCode className="h-4 w-4" />;
      case 'quiz':
        return <LuFileQuestion className="h-4 w-4" />;
      case 'project':
        return <LuClipboardList className="h-4 w-4" />;
      case 'debugging':
        return <LuBug className="h-4 w-4" />;
      default:
        return <LuBookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-emerald-100 text-emerald-700 rounded-full text-xs">Beginner</Badge>;
      case 'intermediate':
        return <Badge className="bg-blue-100 text-blue-700 rounded-full text-xs">Intermediate</Badge>;
      case 'advanced':
        return <Badge className="bg-purple-100 text-purple-700 rounded-full text-xs">Advanced</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full text-xs">{difficulty}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-700 rounded-full text-xs">Published</Badge>;
      case 'draft':
        return <Badge className="bg-amber-100 text-amber-700 rounded-full text-xs">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-slate-100 text-slate-700 rounded-full text-xs">Archived</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exercise Management</h1>
          <p className="text-slate-500 mt-1">Create and manage learning exercises and assignments</p>
        </div>
        <Button className="rounded-full bg-blue-600 hover:bg-blue-700">
          <LuPlus className="mr-2 h-4 w-4" />
          Create Exercise
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600/70 uppercase tracking-wider">Total Exercises</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{exercises.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <LuBookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600/70 uppercase tracking-wider">Published</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {exercises.filter(e => e.status === 'published').length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <LuCheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-indigo-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-600/70 uppercase tracking-wider">Total Completions</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {exercises.reduce((acc, e) => acc + e.completions, 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <LuBarChart className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600/70 uppercase tracking-wider">Avg Score</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {Math.round(exercises.filter(e => e.averageScore > 0).reduce((acc, e) => acc + e.averageScore, 0) / 
                    exercises.filter(e => e.averageScore > 0).length || 0)}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <LuBarChart className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-blue-200/60 bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <LuFilter className="h-4 w-4 text-slate-400" />
              <select 
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="coding">Coding</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="debugging">Debugging</option>
              </select>
              <select 
                value={difficultyFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDifficultyFilter(e.target.value)}
                className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="rounded-2xl border-blue-200/60 bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    {getTypeIcon(exercise.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 line-clamp-1">{exercise.title}</p>
                    <p className="text-xs text-slate-500">{exercise.module}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <LuMoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{exercise.description}</p>

              <div className="flex items-center gap-2 mb-4">
                {getDifficultyBadge(exercise.difficulty)}
                {getStatusBadge(exercise.status)}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                  <LuClock className="h-3 w-3" />
                  Due {new Date(exercise.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <span>{exercise.xpReward} XP</span>
              </div>

              {exercise.status === 'published' && (
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{exercise.completions}</p>
                    <p className="text-xs text-slate-500">Completions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{exercise.averageScore}%</p>
                    <p className="text-xs text-slate-500">Avg Score</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-full h-9 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                  <LuEye className="mr-1 h-3 w-3" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" className="flex-1 rounded-full h-9 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                  <LuEdit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="rounded-full h-9 w-9 p-0 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50">
                  <LuTrash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="rounded-2xl border-blue-200/60 bg-white">
          <CardContent className="p-12 text-center">
            <LuBookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No exercises found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
