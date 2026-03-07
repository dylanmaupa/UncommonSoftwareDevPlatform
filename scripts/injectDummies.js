export {};
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectDummies() {
  console.log('Fetching instructors and students...');
  const { data: instructors } = await supabase.from('profiles').select('id, hub_location').eq('role', 'instructor');
  const { data: students } = await supabase.from('profiles').select('id, hub_location').eq('role', 'student');

  if (!instructors || !students || instructors.length === 0 || students.length === 0) {
    console.error('Needed data (instructors/students) is missing from profiles!');
    process.exit(1);
  }

  const instructor = instructors[0];
  const hubStudents = students.filter(s => s.hub_location === instructor.hub_location);
  
  if (hubStudents.length === 0) {
    console.error('No students found in the instructor\'s hub.');
    process.exit(1);
  }

  const targetStudent = hubStudents[0];

  console.log(`Creating dummy submissions from instructor ${instructor.id} to student ${targetStudent.id}...`);

  const payloads = [
    {
      instructor_id: instructor.id,
      student_id: targetStudent.id,
      title: 'System Architecture Essay',
      instructions: 'Write a 200-word essay explaining the benefits of microservices.',
      language: 'essay',
      starter_code: '',
      due_date: new Date().toISOString(),
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submission_code: 'Microservices offer strong modularity, independent deployment scales, and language-agnostic development. This allows distinct teams to handle specific services without stepping on each others toes. It is far superior to monolitic architecture for large scale applications.',
      submission_output: null,
    },
    {
      instructor_id: instructor.id,
      student_id: targetStudent.id,
      title: 'Python Lists Challenge',
      instructions: 'Write a python function to reverse a list.',
      language: 'python',
      starter_code: 'def reverse_list(lst):\n    pass',
      due_date: new Date().toISOString(),
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submission_code: 'def reverse_list(lst):\n    return lst[::-1]\n\n# Test\nprint(reverse_list([1, 2, 3]))',
      submission_output: '[3, 2, 1]\n',
    }
  ];

  const { error } = await supabase.from('instructor_exercises').insert(payloads);

  if (error) {
    console.error('Insertion failed:', error);
  } else {
    console.log('Successfully injected 2 dummy submissions!');
  }
}

injectDummies();
