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

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
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
      if (!userData.user) throw new Error("Not authenticated");
      const instructorId = userData.user.id;

      // Map 'written' UI type to 'written' db type (I've updated Assignments and Sandbox to handle 'written')
      // Map other types as needed
      let language = 'python';
      if (exercise.type === 'written') language = 'written';
      else if (exercise.type === 'coding') language = 'python'; // Default to python for generic coding
      
      const { error } = await supabase.from('instructor_exercises').insert({
        instructor_id: instructorId,
        student_id: selectedStudentId,
        title: exercise.title,
        instructions: exercise.description,
        due_date: dueDate || null,
        language: language,
        status: 'assigned'
      });

      if (error) throw error;
      
      toast.success(`Exercise assigned to ${students.find(s => s.id === selectedStudentId)?.full_name}`);
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
