# uncommon - Free Interactive Coding Education Platform

A modern, gamified, interactive coding learning platform inspired by Codédex, built with React and styled following uncommon.org's brand identity. This platform provides completely free, open-access coding education without any premium features, paywalls, or community features.

## 🎯 Features

### ✅ Implemented Features

#### User Authentication System
- Sign up with email, password, and nickname
- Log in / Log out functionality
- Password reset capability (UI ready, backend simulation)
- Demo account for quick testing (`demo@example.com` / `demo123`)
- Profile management (edit nickname, view stats)
- Account deletion

#### Main Dashboard
- Personalized welcome message with user nickname
- XP display and level indicator
- Overall progress tracking
- "Continue Learning" feature card
- Grid of available courses with progress indicators
- Quick stats: XP, Level, Streak, Lessons completed
- Left sidebar navigation
- Recent achievements display
- Daily learning tips

#### Courses & Modules System
- Browse all courses (all unlocked, no gates)
- Course detail pages with module/lesson structure
- Accordion-style module navigation
- Progress tracking per module and course
- Lesson completion tracking
- Difficulty badges (Beginner, Intermediate, Advanced)
- Estimated hours and lesson counts
- Visual progress bars

#### Interactive Coding Lessons
- Split-screen layout (lesson content + code editor)
- Dark-themed Monaco code editor
- Syntax highlighting for Python, JavaScript, and more
- Run button with simulated code execution
- Submit button with instant feedback
- Output console
- Hint toggle for additional help
- Solution reveal option
- XP rewards upon completion
- Animated XP gain effects
- Lesson navigation (next lesson button)

#### Gamification System (Non-Competitive)
- XP earning on lesson completion
- Level progression (every 500 XP)
- Achievement badge system
- Visual progress tracking
- Learning streak counter
- Animated achievement unlocks
- No leaderboards or competitive rankings
- Motivational feedback messages

#### Projects Section
- Project-based challenges
- Project briefs with step-by-step instructions
- GitHub repository submission
- Skill tags for each project
- XP rewards for completion
- Project completion badges
- Difficulty levels

#### Achievements Page
- View all achievements (locked and unlocked)
- Achievement progress tracking
- Visual badge display in grid layout
- XP and completion statistics
- Motivational messages

#### Profile Page
- Edit nickname
- View avatar (auto-generated from DiceBear API)
- Display XP, level, and stats
- Show completed courses count
- Total lessons completed
- Projects completed
- Achievements earned
- Current streak
- Courses in progress with progress bars
- Member since date

#### Settings Page
- View account information
- Change password
- Delete account with confirmation dialog
- Platform information

## 🎨 Design System

### Brand Colors (uncommon.org inspired)
- **Primary**: `#0747A1` (Uncommon Blue)
- **Accent**: `#FF6B35` (Orange)
- **Success**: `#10B981` (Green)
- **Secondary**: `#F5F5FA` (Light Gray)
- **Destructive**: `#EF4444` (Red)

### Typography
- **Headings**: Chillax (Google Fonts)
- **Body/UI**: Avenir Next (system fallback)

### Visual Style
- Rounded corners (12px default radius)
- Soft shadows
- Subtle gradients using brand colors
- Clean spacing and hierarchy
- Smooth micro-interactions
- Modern, empowering, youth-driven aesthetic

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18.3.1
- **Routing**: React Router 7 (Data Router pattern)
- **Styling**: Tailwind CSS v4
- **Code Editor**: Monaco Editor (VS Code's editor)
- **Animations**: Motion (Framer Motion)
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Toasts**: Sonner

### Data & State
- Mock data service for authentication
- Local storage for session persistence
- In-memory data structures for courses, lessons, achievements

### Mock Features (Frontend Simulation)
- User authentication (stored in memory)
- Progress tracking
- Code execution (simulated output)
- Achievement unlocking
- XP and level progression

## 📂 Project Structure

```
/src
  /app
    /components
      /auth
        Login.tsx
        Signup.tsx
      /courses
        Courses.tsx
        CourseDetail.tsx
        LessonView.tsx
      /dashboard
        Dashboard.tsx
      /projects
        Projects.tsx
        ProjectDetail.tsx
      /achievements
        Achievements.tsx
      /profile
        Profile.tsx
      /settings
        Settings.tsx
      /layout
        DashboardLayout.tsx
      /ui
        [shadcn components]
      Root.tsx
      NotFound.tsx
    /services
      mockData.ts
    App.tsx
    routes.ts
  /styles
    fonts.css
    theme.css
    tailwind.css
    index.css
```

## 🚀 Getting Started

## Database SQL

Supabase schema and seed files live in [supabase/README.md](/E:/WORK/New%20folder/UncommonSoftwareDevPlatform/supabase/README.md). If you ever need to rebuild the database, run the SQL files in numeric order from the `supabase` folder.

Any future database change should be committed as a new numbered `.sql` file in that folder so the repo stays usable as a rebuild source of truth.

### Demo Account
For quick testing, use:
- **Email**: `demo@example.com`
- **Password**: `demo123`

### Creating a New Account
1. Navigate to the signup page
2. Enter a nickname, email, and password (min 6 characters)
3. All courses and features are immediately unlocked

## 🎓 Course Content

### Available Courses

#### 1. Python Fundamentals (Beginner)
- Getting Started with Python
  - Variables and Data Types
  - Lists and Dictionaries
- Control Flow
  - If Statements

#### 2. JavaScript Essentials (Beginner)
- JavaScript Fundamentals
  - Variables and Constants

#### 3. React Fundamentals (Intermediate)
- Content coming soon

#### 4. Data Structures (Intermediate)
- Content coming soon

## 🏆 Achievements System

Achievements unlock automatically based on:
- Completing lessons
- Earning XP milestones
- Maintaining learning streaks
- Completing courses
- Finishing projects

Examples:
- **First Steps**: Complete your first lesson
- **Quick Learner**: Complete 5 lessons in one day
- **Week Warrior**: Maintain a 7-day streak
- **Centurion**: Earn 1000 XP
- **Course Conqueror**: Complete your first course
- **Project Master**: Complete 3 projects

## 📊 Progress Tracking

### XP System
- Each lesson completion: 50 XP (default)
- Project completion: 200-350 XP
- Level up every 500 XP

### Progress Indicators
- Course-level progress percentage
- Module-level progress percentage
- Lesson completion checkmarks
- Overall dashboard statistics

## 🎮 Gamification Features

- **Visual Feedback**: Animated XP gains, achievement popups
- **Progress Bars**: Course, module, and level progression
- **Badges**: Achievement icons and difficulty tags
- **Streaks**: Daily learning streak counter
- **Levels**: Automatic level progression
- **Stats Dashboard**: Comprehensive metrics display

## 🔒 No Premium Features

This platform is **100% free** with:
- ✅ All courses unlocked from day one
- ✅ All lessons accessible immediately
- ✅ All projects available
- ✅ All features included
- ❌ No subscription system
- ❌ No premium tiers
- ❌ No paywalls
- ❌ No locked content

## 🚫 No Community Features

Per requirements, this platform does **not** include:
- ❌ No forums or discussion boards
- ❌ No comments on lessons
- ❌ No chat functionality
- ❌ No user posts or feeds
- ❌ No leaderboards
- ❌ No social profiles

## 🔐 Data Storage

Currently using:
- **Local Storage**: User session and progress
- **In-Memory**: Course data, achievements, projects

For production, this should be connected to:
- **Backend**: Node.js/Express or Django
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Code Execution**: Secure sandbox (Docker/Judge0)

## 🎯 Future Enhancements

To make this production-ready, consider adding:
- Real backend API integration
- Database persistence
- Secure code execution sandbox
- Email verification
- Password reset via email
- OAuth social login
- More courses and lessons
- More project challenges
- More achievement types
- Certificate generation
- Downloadable progress reports

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices (with adapted layouts)

## ♿ Accessibility

Built with accessibility in mind:
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators

## 📄 License

This is a demo/educational project. Please ensure proper licensing if deploying to production.

## 🙏 Credits

- Design inspiration: Codédex
- Brand identity: uncommon.org
- UI Components: shadcn/ui, Radix UI
- Code Editor: Monaco Editor
- Icons: Lucide React
- Fonts: Google Fonts (Chillax), Avenir Next

---

**Made with ❤️ for learners everywhere. Happy coding! 🚀**
