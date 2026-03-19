-- Create courses table
create table public.courses (
  id text primary key,
  title text not null,
  description text not null,
  icon text,
  difficulty text check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  total_lessons int default 0,
  estimated_hours int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- set RLS for courses
alter table public.courses enable row level security;
create policy "Courses are viewable by everyone." on courses for select using (true);

-- Create modules table (links to courses)
create table public.modules (
  id text primary key,
  course_id text references public.courses(id) on delete cascade not null,
  title text not null,
  description text not null,
  "order" int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.modules enable row level security;
create policy "Modules are viewable by everyone." on modules for select using (true);


-- Create lessons table (links to modules)
create table public.lessons (
  id text primary key,
  module_id text references public.modules(id) on delete cascade not null,
  title text not null,
  content text not null,
  code_example text,
  language text default 'javascript',
  xp_reward int default 50,
  "order" int not null,
  exercise_prompt text,
  exercise_starter_code text,
  exercise_solution text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lessons enable row level security;
create policy "Lessons are viewable by everyone." on lessons for select using (true);


-- Create user_progress table
create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null, -- can mean course_id, module_id, or lesson_id
  item_type text check (item_type in ('course', 'module', 'lesson')),
  status text check (status in ('in_progress', 'completed')),
  progress_percentage int default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, item_id, item_type)
);

alter table public.user_progress enable row level security;
create policy "Users can view their own progress" on user_progress for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on user_progress for update using (auth.uid() = user_id);

-- Insert Mock Data
INSERT INTO public.courses (id, title, description, icon, difficulty, total_lessons, estimated_hours) VALUES
('python-basics', 'Python Fundamentals', 'Master the basics of Python programming from scratch', '🐍', 'Beginner', 12, 8),
('javascript-basics', 'JavaScript Essentials', 'Learn modern JavaScript for web development', '⚡', 'Beginner', 10, 6),
('react-basics', 'React Fundamentals', 'Build modern web apps with React', '⚛️', 'Intermediate', 15, 12),
('data-structures', 'Data Structures', 'Master essential data structures and algorithms', '🌲', 'Intermediate', 20, 16);

INSERT INTO public.modules (id, course_id, title, description, "order") VALUES
('m1', 'python-basics', 'Getting Started with Python', 'Learn the fundamentals of Python syntax and data types', 1),
('m2', 'python-basics', 'Control Flow', 'Learn about conditionals and loops', 2),
('m3', 'javascript-basics', 'JavaScript Fundamentals', 'Core concepts of JavaScript', 1);

INSERT INTO public.lessons (id, module_id, title, "order", language, xp_reward, content, code_example, exercise_prompt, exercise_starter_code, exercise_solution) VALUES
('l1', 'm1', 'Variables and Data Types', 1, 'python', 50, '# Variables and Data Types in Python

In Python, variables are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable - it is created the moment you assign a value to it.

## Basic Data Types

Python has several built-in data types:
- **Integers**: Whole numbers like 5, 100, -23
- **Floats**: Decimal numbers like 3.14, -0.5
- **Strings**: Text data like "Hello", ''Python''
- **Booleans**: True or False values

Variables in Python are dynamically typed, meaning you don''t need to specify the type when creating them.', '# Integer
age = 25

# Float
price = 19.99

# String
name = "Alice"

# Boolean
is_student = True

# Print variables
print(f"Name: {name}, Age: {age}")
print(f"Price: ${price}")
print(f"Is student: {is_student}")', 'Create variables for a person named "Bob" who is 30 years old, has a height of 5.9 feet, and is employed. Print all variables.', '# Create your variables here
name = 
age = 
height = 
is_employed = 

# Print the variables
print(f"Name: {name}")', 'name = "Bob"
age = 30
height = 5.9
is_employed = True

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height} feet")
print(f"Employed: {is_employed}")'),

('l2', 'm1', 'Lists and Dictionaries', 2, 'python', 50, '# Lists and Dictionaries

Lists and dictionaries are two of the most important data structures in Python.

## Lists
Lists are ordered, mutable collections of items. They can contain items of different types.

## Dictionaries
Dictionaries store key-value pairs and are unordered. They''re perfect for storing related data.', '# List example
fruits = ["apple", "banana", "cherry"]
fruits.append("orange")
print(fruits[0])  # Output: apple

# Dictionary example
person = {
    "name": "Alice",
    "age": 25,
    "city": "New York"
}
print(person["name"])  # Output: Alice', 'Create a list of 3 programming languages and a dictionary with your favorite book details (title, author, year).', '# Create a list of programming languages
languages = 

# Create a dictionary for a book
book = {
    
}', 'languages = ["Python", "JavaScript", "Go"]

book = {
    "title": "Clean Code",
    "author": "Robert Martin",
    "year": 2008
}'),

('l3', 'm2', 'If Statements', 1, 'python', 50, '# Conditional Statements

Conditional statements allow your program to make decisions based on conditions.

The basic syntax uses if, elif, and else keywords.', 'age = 18

if age >= 18:
    print("You are an adult")
elif age >= 13:
    print("You are a teenager")
else:
    print("You are a child")', 'Write a program that checks if a number is positive, negative, or zero.', 'number = 10

# Write your if statement here', 'number = 10

if number > 0:
    print("Positive")
elif number < 0:
    print("Negative")
else:
    print("Zero")'),

('l4', 'm3', 'Variables and Constants', 1, 'javascript', 50, '# JavaScript Variables

JavaScript has three ways to declare variables:
- **let**: Block-scoped, can be reassigned
- **const**: Block-scoped, cannot be reassigned
- **var**: Function-scoped (avoid in modern JS)', '// Using let
let name = "Alice";
name = "Bob"; // OK

// Using const
const PI = 3.14159;
// PI = 3.14; // Error!

// Variable types
let age = 25;           // number
let message = "Hello";  // string
let isActive = true;    // boolean', 'Create a const for your name and a let for your age. Update the age variable.', '// Declare your variables here
', 'const name = "Alice";
let age = 25;
age = 26;
console.log(name, age);');
