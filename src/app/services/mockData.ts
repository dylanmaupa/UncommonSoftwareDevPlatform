// Mock data service for the coding learning platform

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  completedLessons: string[];
  completedProjects: string[];
  achievements: string[];
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: Module[];
  totalLessons: number;
  estimatedHours: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  codeExample: string;
  language: string;
  exercise: {
    prompt: string;
    starterCode: string;
    solution: string;
    testCases: { input: string; expectedOutput: string }[];
  };
  xpReward: number;
  order: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpRequired?: number;
  condition: string;
  unlocked: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  xpReward: number;
  instructions: string[];
}

// Mock storage
let currentUser: User | null = null;

// Mock user storage
const users: Map<string, { password: string; user: User }> = new Map();

// Initialize with a demo user
users.set('demo@example.com', {
  password: 'demo123',
  user: {
    id: '1',
    email: 'demo@example.com',
    nickname: 'CodeMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeMaster',
    xp: 2450,
    level: 5,
    streak: 7,
    completedLessons: ['l1', 'l2', 'l3', 'l4', 'l5'],
    completedProjects: ['p1'],
    achievements: ['a1', 'a2', 'a3'],
    createdAt: '2024-01-15',
  },
});

// Seeded uncommon.org account for direct sign-in
users.set('vincent@uncommon.org', {
  password: 'vin12345',
  user: {
    id: '2',
    email: 'vincent@uncommon.org',
    nickname: 'Vincent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vincent',
    xp: 0,
    level: 1,
    streak: 0,
    completedLessons: [],
    completedProjects: [],
    achievements: [],
    createdAt: new Date().toISOString(),
  },
});

// Mock courses data
export const coursesData: Course[] = [
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Master the basics of Python programming from scratch',
    icon: '🐍',
    difficulty: 'Beginner',
    totalLessons: 12,
    estimatedHours: 8,
    modules: [
      {
        id: 'm1',
        courseId: 'python-basics',
        title: 'Getting Started with Python',
        description: 'Learn the fundamentals of Python syntax and data types',
        order: 1,
        lessons: [
          {
            id: 'l1',
            moduleId: 'm1',
            title: 'Variables and Data Types',
            order: 1,
            language: 'python',
            xpReward: 50,
            content: `# Variables and Data Types in Python

In Python, variables are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable - it is created the moment you assign a value to it.

## Basic Data Types

Python has several built-in data types:
- **Integers**: Whole numbers like 5, 100, -23
- **Floats**: Decimal numbers like 3.14, -0.5
- **Strings**: Text data like "Hello", 'Python'
- **Booleans**: True or False values

Variables in Python are dynamically typed, meaning you don't need to specify the type when creating them.`,
            codeExample: `# Integer
age = 25

# Float
price = 19.99

# String
name = "Alice"

# Boolean
is_student = True

# Print variables
print(f"Name: {name}, Age: {age}")
print(f"Price: ${'$'}{price}")
print(f"Is student: {is_student}")`,
            exercise: {
              prompt: 'Create variables for a person named "Bob" who is 30 years old, has a height of 5.9 feet, and is employed. Print all variables.',
              starterCode: `# Create your variables here\nname = \nage = \nheight = \nis_employed = \n\n# Print the variables\nprint(f"Name: {name}")`,
              solution: `name = "Bob"\nage = 30\nheight = 5.9\nis_employed = True\n\nprint(f"Name: {name}")\nprint(f"Age: {age}")\nprint(f"Height: {height} feet")\nprint(f"Employed: {is_employed}")`,
              testCases: [
                { input: '', expectedOutput: 'Name: Bob\nAge: 30\nHeight: 5.9 feet\nEmployed: True' },
              ],
            },
          },
          {
            id: 'l2',
            moduleId: 'm1',
            title: 'Lists and Dictionaries',
            order: 2,
            language: 'python',
            xpReward: 50,
            content: `# Lists and Dictionaries

Lists and dictionaries are two of the most important data structures in Python.

## Lists
Lists are ordered, mutable collections of items. They can contain items of different types.

## Dictionaries
Dictionaries store key-value pairs and are unordered. They're perfect for storing related data.`,
            codeExample: `# List example
fruits = ["apple", "banana", "cherry"]
fruits.append("orange")
print(fruits[0])  # Output: apple

# Dictionary example
person = {
    "name": "Alice",
    "age": 25,
    "city": "New York"
}
print(person["name"])  # Output: Alice`,
            exercise: {
              prompt: 'Create a list of 3 programming languages and a dictionary with your favorite book details (title, author, year).',
              starterCode: `# Create a list of programming languages\nlanguages = \n\n# Create a dictionary for a book\nbook = {\n    \n}`,
              solution: `languages = ["Python", "JavaScript", "Go"]\n\nbook = {\n    "title": "Clean Code",\n    "author": "Robert Martin",\n    "year": 2008\n}`,
              testCases: [],
            },
          },
        ],
      },
      {
        id: 'm2',
        courseId: 'python-basics',
        title: 'Control Flow',
        description: 'Learn about conditionals and loops',
        order: 2,
        lessons: [
          {
            id: 'l3',
            moduleId: 'm2',
            title: 'If Statements',
            order: 1,
            language: 'python',
            xpReward: 50,
            content: `# Conditional Statements

Conditional statements allow your program to make decisions based on conditions.

The basic syntax uses if, elif, and else keywords.`,
            codeExample: `age = 18

if age >= 18:
    print("You are an adult")
elif age >= 13:
    print("You are a teenager")
else:
    print("You are a child")`,
            exercise: {
              prompt: 'Write a program that checks if a number is positive, negative, or zero.',
              starterCode: `number = 10\n\n# Write your if statement here`,
              solution: `number = 10\n\nif number > 0:\n    print("Positive")\nelif number < 0:\n    print("Negative")\nelse:\n    print("Zero")`,
              testCases: [],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'javascript-basics',
    title: 'JavaScript Essentials',
    description: 'Learn modern JavaScript for web development',
    icon: '⚡',
    difficulty: 'Beginner',
    totalLessons: 10,
    estimatedHours: 6,
    modules: [
      {
        id: 'm3',
        courseId: 'javascript-basics',
        title: 'JavaScript Fundamentals',
        description: 'Core concepts of JavaScript',
        order: 1,
        lessons: [
          {
            id: 'l4',
            moduleId: 'm3',
            title: 'Variables and Constants',
            order: 1,
            language: 'javascript',
            xpReward: 50,
            content: `# JavaScript Variables

JavaScript has three ways to declare variables:
- **let**: Block-scoped, can be reassigned
- **const**: Block-scoped, cannot be reassigned
- **var**: Function-scoped (avoid in modern JS)`,
            codeExample: `// Using let
let name = "Alice";
name = "Bob"; // OK

// Using const
const PI = 3.14159;
// PI = 3.14; // Error!

// Variable types
let age = 25;           // number
let message = "Hello";  // string
let isActive = true;    // boolean`,
            exercise: {
              prompt: 'Create a const for your name and a let for your age. Update the age variable.',
              starterCode: `// Declare your variables here\n`,
              solution: `const name = "Alice";\nlet age = 25;\nage = 26;\nconsole.log(name, age);`,
              testCases: [],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'react-basics',
    title: 'React Fundamentals',
    description: 'Build modern web apps with React',
    icon: '⚛️',
    difficulty: 'Intermediate',
    totalLessons: 15,
    estimatedHours: 12,
    modules: [],
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Master essential data structures and algorithms',
    icon: '🌲',
    difficulty: 'Intermediate',
    totalLessons: 20,
    estimatedHours: 16,
    modules: [],
  },
];

// Mock achievements data
export const achievementsData: Achievement[] = [
  {
    id: 'a1',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    condition: 'Complete 1 lesson',
    unlocked: false,
  },
  {
    id: 'a2',
    title: 'Quick Learner',
    description: 'Complete 5 lessons in one day',
    icon: '⚡',
    condition: 'Complete 5 lessons in 24 hours',
    unlocked: false,
  },
  {
    id: 'a3',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    condition: 'Maintain 7-day streak',
    unlocked: false,
  },
  {
    id: 'a4',
    title: 'Centurion',
    description: 'Earn 1000 XP',
    icon: '💯',
    xpRequired: 1000,
    condition: 'Earn 1000 XP',
    unlocked: false,
  },
  {
    id: 'a5',
    title: 'Course Conqueror',
    description: 'Complete your first course',
    icon: '🏆',
    condition: 'Complete 1 course',
    unlocked: false,
  },
  {
    id: 'a6',
    title: 'Project Master',
    description: 'Complete 3 projects',
    icon: '🚀',
    condition: 'Complete 3 projects',
    unlocked: false,
  },
];

// Mock projects data
export const projectsData: Project[] = [
  {
    id: 'p1',
    title: 'Calculator App',
    description: 'Build a functional calculator using Python',
    difficulty: 'Beginner',
    skills: ['Python', 'Functions', 'User Input'],
    xpReward: 200,
    instructions: [
      'Create a calculator that can add, subtract, multiply, and divide',
      'Use functions for each operation',
      'Handle user input and display results',
      'Add error handling for division by zero',
    ],
  },
  {
    id: 'p2',
    title: 'Todo List App',
    description: 'Create a todo list application with JavaScript',
    difficulty: 'Beginner',
    skills: ['JavaScript', 'DOM Manipulation', 'Arrays'],
    xpReward: 250,
    instructions: [
      'Allow users to add new tasks',
      'Mark tasks as complete',
      'Delete tasks',
      'Store tasks in local storage',
    ],
  },
  {
    id: 'p3',
    title: 'Weather Dashboard',
    description: 'Build a weather app using an API',
    difficulty: 'Intermediate',
    skills: ['JavaScript', 'APIs', 'React'],
    xpReward: 350,
    instructions: [
      'Fetch weather data from an API',
      'Display current weather and forecast',
      'Add search functionality for different cities',
      'Create a responsive design',
    ],
  },
];

// Auth functions
export const authService = {
  login: (email: string, password: string): User | null => {
    const userData = users.get(email);
    if (userData && userData.password === password) {
      currentUser = userData.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      return currentUser;
    }
    return null;
  },

  signup: (email: string, password: string, nickname: string): User | null => {
    if (users.has(email)) {
      return null; // User already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      nickname,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`,
      xp: 0,
      level: 1,
      streak: 0,
      completedLessons: [],
      completedProjects: [],
      achievements: [],
      createdAt: new Date().toISOString(),
    };

    users.set(email, { password, user: newUser });
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return newUser;
  },

  logout: () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    if (currentUser) return currentUser;
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },

  updateUser: (updates: Partial<User>): User | null => {
    if (!currentUser) return null;
    
    currentUser = { ...currentUser, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update in users map
    const userData = users.get(currentUser.email);
    if (userData) {
      userData.user = currentUser;
    }
    
    return currentUser;
  },

  deleteAccount: () => {
    if (currentUser) {
      users.delete(currentUser.email);
      currentUser = null;
      localStorage.removeItem('currentUser');
    }
  },
};

// Progress tracking
export const progressService = {
  completeLesson: (lessonId: string, xpReward: number) => {
    if (!currentUser) return;
    
    if (!currentUser.completedLessons.includes(lessonId)) {
      currentUser.completedLessons.push(lessonId);
      currentUser.xp += xpReward;
      
      // Level up logic (every 500 XP)
      const newLevel = Math.floor(currentUser.xp / 500) + 1;
      if (newLevel > currentUser.level) {
        currentUser.level = newLevel;
      }
      
      authService.updateUser(currentUser);
    }
  },

  completeProject: (projectId: string, xpReward: number) => {
    if (!currentUser) return;
    
    if (!currentUser.completedProjects.includes(projectId)) {
      currentUser.completedProjects.push(projectId);
      currentUser.xp += xpReward;
      
      const newLevel = Math.floor(currentUser.xp / 500) + 1;
      if (newLevel > currentUser.level) {
        currentUser.level = newLevel;
      }
      
      authService.updateUser(currentUser);
    }
  },

  unlockAchievement: (achievementId: string) => {
    if (!currentUser) return;
    
    if (!currentUser.achievements.includes(achievementId)) {
      currentUser.achievements.push(achievementId);
      authService.updateUser(currentUser);
    }
  },

  getCourseProgress: (courseId: string): number => {
    if (!currentUser) return 0;
    
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return 0;
    
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedLessons = course.modules
      .flatMap(m => m.lessons)
      .filter(l => currentUser.completedLessons.includes(l.id))
      .length;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  },

  getModuleProgress: (moduleId: string): number => {
    if (!currentUser) return 0;
    
    let module: Module | undefined;
    for (const course of coursesData) {
      module = course.modules.find(m => m.id === moduleId);
      if (module) break;
    }
    
    if (!module) return 0;
    
    const completedLessons = module.lessons.filter(l => 
      currentUser.completedLessons.includes(l.id)
    ).length;
    
    return module.lessons.length > 0 
      ? Math.round((completedLessons / module.lessons.length) * 100) 
      : 0;
  },

  isLessonCompleted: (lessonId: string): boolean => {
    return currentUser?.completedLessons.includes(lessonId) || false;
  },

  isProjectCompleted: (projectId: string): boolean => {
    return currentUser?.completedProjects.includes(projectId) || false;
  },
};
