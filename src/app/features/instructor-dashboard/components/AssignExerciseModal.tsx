import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';

interface Student {
  id: string;
  full_name: string;
  email: string;
  hub_location?: string;
}

interface AssignExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    title: string;
    description: string;
    type: string;
  } | null;
}

export default function AssignExerciseModal({ isOpen, onClose, exercise }: AssignExerciseModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const [instructorHub, setInstructorHub] = useState<string>('');

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      // Resolve the instructor's hub synchronously in one query
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: instructorProfile } = await supabase
        .from('profiles')
        .select('hub_location')
        .eq('id', userData.user.id)
        .single();

      // Use the local variable — NOT the state, which may not have updated yet
      const hub = instructorProfile?.hub_location || '';
      setInstructorHub(hub);

      if (!hub) {
        toast.error('Your account does not have a hub location set.');
        return;
      }

      // Fetch students in the same hub
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, hub_location')
        .eq('role', 'student')
        .eq('hub_location', hub)
        .order('full_name');
      
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students list.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleAssign = async () => {
    if (!exercise || !selectedStudentId) {
      toast.error('Please select a student.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      const instructorId = userData.user.id;

      // Re-fetch the instructor's hub at submit time to guarantee correctness
      const { data: instructorProfile } = await supabase
        .from('profiles')
        .select('hub_location')
        .eq('id', instructorId)
        .single();

      const hub = instructorProfile?.hub_location || instructorHub;

      if (!hub) {
        toast.error('Cannot determine your hub location. Please refresh and try again.');
        return;
      }

      let language = 'python';
      if (exercise.type === 'written') language = 'written';
      else if (exercise.type === 'quiz') language = 'written';
      // coding / debugging / project → python

      const { error } = await supabase.from('instructor_exercises').insert({
        instructor_id: instructorId,
        student_id: selectedStudentId,
        hub_location: hub,           // always uses instructor's hub
        title: exercise.title,
        instructions: exercise.description,
        due_date: dueDate || null,
        language: language,
        status: 'assigned'
      });

      if (error) throw error;
      
      const studentName = students.find(s => s.id === selectedStudentId)?.full_name;
      toast.success(`Exercise assigned to ${studentName}`);
      onClose();
      setSelectedStudentId('');
      setDueDate('');
    } catch (err) {
      console.error('Error assigning exercise:', err);
      toast.error('Failed to assign exercise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign to Student</DialogTitle>
          <DialogDescription>
            Send "{exercise?.title}" to a student in your hub.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Student</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingStudents ? "Loading students..." : "Select a student"} />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting || !selectedStudentId}>
            {isSubmitting ? 'Assigning...' : 'Send Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
