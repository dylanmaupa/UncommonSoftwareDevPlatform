import { createBrowserRouter, redirect } from 'react-router';
import Root from './components/Root';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
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
import InstructorLayoutPage from './features/instructor-dashboard/pages/InstructorLayoutPage';
import InstructorHomePage from './features/instructor-dashboard/pages/InstructorHomePage';
import InstructorLearnersPage from './features/instructor-dashboard/pages/InstructorLearnersPage';
import InstructorLearnerProfilePage from './features/instructor-dashboard/pages/InstructorLearnerProfilePage';
import InstructorAssessmentsPage from './features/instructor-dashboard/pages/InstructorAssessmentsPage';
import InstructorProjectsInsightsPage from './features/instructor-dashboard/pages/InstructorProjectsInsightsPage';
import InstructorSubmissionReviewPage from './features/instructor-dashboard/pages/InstructorSubmissionReviewPage';
import AdminLayoutPage from './features/admin-dashboard/pages/AdminLayoutPage';
import AdminOverviewPage from './features/admin-dashboard/pages/AdminOverviewPage';
import AdminHubDetailPage from './features/admin-dashboard/pages/AdminHubDetailPage';
import AdminStudentsPage from './features/admin-dashboard/pages/AdminStudentsPage';

import NotFound from './components/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: 'signup', Component: Signup },
      { path: 'dashboard', Component: Dashboard },
      {
        path: 'admin',
        Component: AdminLayoutPage,
        children: [
          { index: true, Component: AdminOverviewPage },
          { path: 'hubs', Component: AdminOverviewPage },
          { path: 'hubs/:hubId', Component: AdminHubDetailPage },
          { path: 'students', Component: AdminStudentsPage },
        ],
      },
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
          { index: true, Component: InstructorHomePage },
          { path: 'students', Component: InstructorLearnersPage },
          { path: 'students/:studentId', Component: InstructorLearnerProfilePage },
          { path: 'assessments', Component: InstructorAssessmentsPage },
          { path: 'assessments/:exerciseId', Component: InstructorSubmissionReviewPage },
          { path: 'projects', Component: InstructorProjectsInsightsPage },
        ],
      },
      { path: '*', Component: NotFound },
    ],
  },
]);


