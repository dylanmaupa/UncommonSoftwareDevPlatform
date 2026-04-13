import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';
import { LuTarget, LuClock, LuUsers, LuBookOpen, LuCalendar } from 'react-icons/lu';

interface Assignment {
  id: string;
  instructor_id: string;
  student_id: string | null;
  hub_location: string;
  title: string;
  instructions: string;
  language: string;
  due_date: string | null;
  status: string;
  created_at: string;
  submitted_at: string | null;
  submission_count?: number;
}

interface Hub {
  id: string;
  name: string;
}

export default function InstructorAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [instructorHub, setInstructorHub] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'not-submitted'>('all');

  useEffect(() => {
    fetchInstructorHub();
  }, []);

  useEffect(() => {
    if (selectedHub) {
      fetchAssignments();
    }
  }, [selectedHub]);

  const fetchInstructorHub = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('hub_location')
        .eq('id', user.id)
        .single();

      if (profile?.hub_location) {
        setInstructorHub(profile.hub_location);
        setSelectedHub(profile.hub_location);
        
        // For now, use the instructor's hub as the only option
        // In the future, instructors could manage multiple hubs
        setHubs([{ id: profile.hub_location, name: profile.hub_location }]);
      }
    } catch (err) {
      console.error('Error fetching instructor hub:', err);
    }
  };

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch ALL assignments for the selected hub
      const { data: exercises, error } = await supabase
        .from('instructor_exercises')
        .select('*')
        .eq('hub_location', selectedHub)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count submissions per assignment
      const assignmentsWithCount = (exercises || []).map((ex: any) => ({
        ...ex,
        submission_count: ex.status === 'submitted' || ex.status === 'reviewed' ? 1 : 0
      }));

      setAssignments(assignmentsWithCount);
      console.log('[Instructor] Hub assignments fetched:', assignmentsWithCount.length);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'submitted') return a.status === 'submitted' || a.status === 'reviewed';
    if (filter === 'not-submitted') return a.status === 'assigned';
    return true;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
            <LuBookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assignments Overview</h1>
            <p className="text-sm text-slate-500">View all assignments for your hub</p>
          </div>
        </div>

        {/* Hub Selector */}
        <div className="mt-4 flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedHub} onValueChange={setSelectedHub}>
              <SelectTrigger>
                <SelectValue placeholder="Select a hub" />
              </SelectTrigger>
              <SelectContent>
                {hubs.map((hub) => (
                  <SelectItem key={hub.id} value={hub.id}>
                    {hub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={fetchAssignments} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-full text-xs"
          >
            All ({assignments.length})
          </Button>
          <Button
            variant={filter === 'submitted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('submitted')}
            className="rounded-full text-xs"
          >
            Submitted ({assignments.filter(a => a.status === 'submitted' || a.status === 'reviewed').length})
          </Button>
          <Button
            variant={filter === 'not-submitted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('not-submitted')}
            className="rounded-full text-xs"
          >
            Not Submitted ({assignments.filter(a => a.status === 'assigned').length})
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          Loading assignments...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <LuTarget className="h-8 w-8 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No assignments found</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === 'all' 
                ? 'No assignments have been created for this hub yet.' 
                : 'No assignments match the selected filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {assignment.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      Created {new Date(assignment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.status === 'assigned' ? (
                      <Badge className="bg-blue-100 text-blue-700">Pending</Badge>
                    ) : assignment.status === 'submitted' ? (
                      <Badge className="bg-amber-100 text-amber-700">Submitted</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700">Reviewed</Badge>
                    )}
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {assignment.language}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {assignment.instructions}
                </p>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <LuCalendar className="h-4 w-4" />
                    <span>Due: {formatDate(assignment.due_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500">
                    <LuUsers className="h-4 w-4" />
                    <span>
                      {assignment.student_id ? 'Individual assignment' : 'Hub-wide assignment'}
                    </span>
                  </div>

                  {assignment.submission_count !== undefined && assignment.submission_count > 0 && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <LuTarget className="h-4 w-4" />
                      <span>{assignment.submission_count} submission(s)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
