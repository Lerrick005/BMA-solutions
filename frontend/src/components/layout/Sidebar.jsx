import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings,
  Sparkles,
  Shield,
  UserCircle,
  CheckSquare,
  KanbanSquare,
  Calendar as CalendarIcon,
  Upload,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: '🏠 Dashboard' },
    { to: '/leads', icon: Users, label: '📋 Leads' },
    { to: '/kanban', icon: KanbanSquare, label: '📊 Kanban' },
    { to: '/calendar', icon: CalendarIcon, label: '📅 Calendar' },
    { to: '/analytics', icon: BarChart3, label: '📊 Analytics' },
    { to: '/tasks', icon: CheckSquare, label: '✅ Tasks' },
    { to: '/import', icon: Upload, label: '📤 Import' },
    { to: '/reports', icon: FileText, label: '📊 Reports' },
    { to: '/admin', icon: Shield, label: '⚙️ Admin' },
    { to: '/profile', icon: UserCircle, label: '👤 Profile' },
    { to: '/settings', icon: Settings, label: '🔧 Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-soft z-50">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-100">
        <Sparkles className="w-6 h-6 text-primary" />
        <span className="text-lg font-bold text-gray-800">
          BMA<span className="text-primary">Solutions</span>
        </span>
      </div>

      <nav className="px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;