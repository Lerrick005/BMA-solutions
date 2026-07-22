import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Leads from '../pages/Leads/Leads';
import Analytics from '../pages/Analytics/Analytics';
import Settings from '../pages/Settings/Settings';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import Profile from '../pages/Profile/Profile';
import Tasks from '../pages/Tasks/Tasks';
import Kanban from '../pages/Kanban/Kanban';
import Calendar from '../pages/Calendar/Calendar';
import Import from '../pages/Import/Import';
import Reports from '../pages/Reports/Reports';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'leads',
        element: <Leads />,
      },
      {
        path: 'kanban',
        element: <Kanban />,
      },
      {
        path: 'calendar',
        element: <Calendar />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'import',
        element: <Import />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
    ],
  },
]);