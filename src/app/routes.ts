import { createBrowserRouter } from 'react-router';
import Root from './components/Root';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import Admin from './components/admin/Admin';
import Courses from './components/courses/Courses';
import CourseDetail from './components/courses/CourseDetail';
import LessonView from './components/courses/LessonView';
import Sandbox from './components/sandbox/Sandbox';
import Projects from './components/projects/Projects';
import ProjectDetail from './components/projects/ProjectDetail';
import Achievements from './components/achievements/Achievements';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import InstructorLayoutPage from './features/instructor-dashboard/pages/InstructorLayoutPage';
import InstructorDashboardPage from './features/instructor-dashboard/pages/InstructorDashboardPage';
import HubsPage from './features/instructor-dashboard/pages/HubsPage';
import StudentsPage from './features/instructor-dashboard/pages/StudentsPage';
import StudentProfilePage from './features/instructor-dashboard/pages/StudentProfilePage';
import NotFound from './components/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: 'signup', Component: Signup },
      { path: 'dashboard', Component: Dashboard },
      { path: 'admin', Component: Admin },
      { path: 'sandbox', Component: Sandbox },
      { path: 'courses', Component: Courses },
      { path: 'courses/:courseId', Component: CourseDetail },
      { path: 'courses/:courseId/modules/:moduleId/lessons/:lessonId', Component: LessonView },
      { path: 'projects', Component: Projects },
      { path: 'projects/:projectId', Component: ProjectDetail },
      { path: 'achievements', Component: Achievements },
      { path: 'profile', Component: Profile },
      { path: 'settings', Component: Settings },
      {
        path: 'instructor',
        Component: InstructorLayoutPage,
        children: [
          { index: true, Component: InstructorDashboardPage },
          { path: 'hubs', Component: HubsPage },
          { path: 'students', Component: StudentsPage },
          { path: 'students/:studentId', Component: StudentProfilePage },
        ],
      },
      { path: '*', Component: NotFound },
    ],
  },
]);


