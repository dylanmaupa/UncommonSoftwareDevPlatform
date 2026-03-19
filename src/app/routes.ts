import { createBrowserRouter, redirect } from 'react-router';
import Root from './components/Root';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import UpdatePassword from './components/auth/UpdatePassword';
import Dashboard from './components/dashboard/Dashboard';
import Courses from './components/courses/Courses';
import CourseDetail from './components/courses/CourseDetail';
import LessonView from './components/courses/LessonView';
import Sandbox from './components/sandbox/Sandbox';
import Projects from './components/projects/Projects';
import ProjectDetail from './components/projects/ProjectDetail';
import Achievements from './components/achievements/Achievements';
import Profile from './components/profile/Profile';
import Settings from './components/settings/Settings';
import Admin from './components/admin/Admin';
import Assignments from './components/assignments/Assignments';

import NotFound from './components/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: 'signup', Component: Signup },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'update-password', Component: UpdatePassword },
      { path: 'dashboard', Component: Dashboard },
      { path: 'instructor', Component: Admin },
      { path: 'instructor/:section', Component: Admin },
      { path: 'sandbox', Component: Sandbox },
      { path: 'courses', Component: Courses },
      { path: 'courses/:courseId', Component: CourseDetail },
      { path: 'courses/:courseId/modules/:moduleId/lessons/:lessonId', Component: LessonView },
      { path: 'projects', Component: Projects },
      { path: 'projects/:projectId', Component: ProjectDetail },
      { path: 'achievements', Component: Achievements },
      { path: 'assignments', Component: Assignments },
      { path: 'profile', Component: Profile },
      { path: 'settings', Component: Settings },
      { path: '*', Component: NotFound },
    ],
  },
]);


