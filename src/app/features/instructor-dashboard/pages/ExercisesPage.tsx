import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
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
  LuEllipsis,
  LuPencil,
  LuTrash2,
  LuEye,
  LuCircleCheck,
  LuActivity,
  LuX,
  LuSave,
  LuFileText
} from 'react-icons/lu';
import WrittenAssignmentEditor from '../components/WrittenAssignmentEditor';
import CodeAssignmentPortal from '../components/CodeAssignmentPortal';

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'quiz' | 'project' | 'debugging' | 'written';
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
  {
    id: '6',
    title: 'Explain the React Lifecycle',
    description: 'In your own words, explain the React component lifecycle including mounting, updating, and unmounting phases. Discuss how hooks like useEffect relate to these phases.',
    type: 'written',
    difficulty: 'intermediate',
    module: 'React Fundamentals',
    deadline: '2024-03-28',
    xpReward: 80,
    completions: 12,
    averageScore: 74,
    status: 'published'
  },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  
  // Create exercise modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    title: '',
    description: '',
    type: 'coding',
    difficulty: 'beginner',
    module: '',
    deadline: '',
    xpReward: 100,
    status: 'draft'
  });

  // Written assignment editor state
  const [writtenEditorExercise, setWrittenEditorExercise] = useState<Exercise | null>(null);

  // Code assignment portal state
  const [codePortalExercise, setCodePortalExercise] = useState<Exercise | null>(null);

  const handleCreateExercise = () => {
    if (newExercise.title && newExercise.description && newExercise.module && newExercise.deadline) {
      const exercise: Exercise = {
        id: Date.now().toString(),
        title: newExercise.title,
        description: newExercise.description,
        type: newExercise.type as Exercise['type'],
        difficulty: newExercise.difficulty as Exercise['difficulty'],
        module: newExercise.module,
        deadline: newExercise.deadline,
        xpReward: newExercise.xpReward || 100,
        completions: 0,
        averageScore: 0,
        status: newExercise.status as Exercise['status']
      };
      setExercises([exercise, ...exercises]);
      setShowCreateModal(false);
      setNewExercise({
        title: '',
        description: '',
        type: 'coding',
        difficulty: 'beginner',
        module: '',
        deadline: '',
        xpReward: 100,
        status: 'draft'
      });
    }
  };

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
      case 'written':
        return <LuFileText className="h-4 w-4" />;
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
        <Button 
          className="rounded-full bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateModal(true)}
        >
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
                <LuCircleCheck className="h-5 w-5" />
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
                <LuActivity className="h-5 w-5" />
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
                <LuActivity className="h-5 w-5" />
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
                <option value="written">Written</option>
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
                  <LuEllipsis className="h-4 w-4" />
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
                {exercise.type === 'written' ? (
                  <Button
                    size="sm"
                    className="flex-1 rounded-full h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => setWrittenEditorExercise(exercise)}
                  >
                    <LuFileText className="mr-1 h-3 w-3" />
                    Open Exercise
                  </Button>
                ) : (exercise.type === 'coding' || exercise.type === 'debugging') ? (
                  <Button
                    size="sm"
                    className="flex-1 rounded-full h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setCodePortalExercise(exercise)}
                  >
                    <LuCode className="mr-1 h-3 w-3" />
                    Open IDE
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="flex-1 rounded-full h-9 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                    <LuEye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                )}
                <Button size="sm" variant="outline" className="flex-1 rounded-full h-9 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                  <LuPencil className="mr-1 h-3 w-3" />
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

      {/* Written Assignment Editor Modal */}
      {writtenEditorExercise && (
        <WrittenAssignmentEditor
          exercise={writtenEditorExercise}
          onClose={() => setWrittenEditorExercise(null)}
        />
      )}

      {/* Code Assignment Portal Modal */}
      {codePortalExercise && (
        <CodeAssignmentPortal
          exercise={codePortalExercise}
          onClose={() => setCodePortalExercise(null)}
        />
      )}

      {/* Create Exercise Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-16">
          <Card className="rounded-2xl border-blue-200/60 bg-white w-full max-w-2xl flex flex-col" style={{ maxHeight: '50vh' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">Create New Exercise</CardTitle>
                <CardDescription>Define a new learning exercise for your students</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => setShowCreateModal(false)}
              >
                <LuX className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Exercise Title *</label>
                <Input 
                  placeholder="e.g., React Hooks Challenge"
                  value={newExercise.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({...newExercise, title: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
                <Textarea 
                  placeholder="Describe what students will learn and accomplish..."
                  value={newExercise.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewExercise({...newExercise, description: e.target.value})}
                  className="min-h-[100px] rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Exercise Type</label>
                  <select 
                    value={newExercise.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewExercise({...newExercise, type: e.target.value as Exercise['type']})}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="coding">Coding</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                    <option value="debugging">Debugging</option>
                    <option value="written">Written Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Difficulty Level</label>
                  <select
                    value={newExercise.difficulty}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewExercise({...newExercise, difficulty: e.target.value as Exercise['difficulty']})}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Module/Course *</label>
                <Input 
                  placeholder="e.g., React Fundamentals"
                  value={newExercise.module}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({...newExercise, module: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Deadline *</label>
                  <Input 
                    type="date"
                    value={newExercise.deadline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({...newExercise, deadline: e.target.value})}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">XP Reward</label>
                  <Input 
                    type="number"
                    min="0"
                    max="1000"
                    value={newExercise.xpReward}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExercise({...newExercise, xpReward: parseInt(e.target.value) || 0})}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewExercise({...newExercise, status: 'draft'})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newExercise.status === 'draft' 
                        ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => setNewExercise({...newExercise, status: 'published'})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newExercise.status === 'published' 
                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
            </CardContent>

            {/* Sticky Footer — always visible */}
            <div className="flex gap-2 px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <Button 
                className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateExercise}
                disabled={!newExercise.title || !newExercise.description || !newExercise.module || !newExercise.deadline}
              >
                <LuSave className="mr-2 h-4 w-4" />
                Create Exercise
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full border-slate-200"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
