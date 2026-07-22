
import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  Shield,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  X,
  Download
} from 'lucide-react';
import userService from '../../services/userService';
import { systemSettings } from '../../data/usersData';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [settings] = useState(systemSettings);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    department: 'Sales',
    phone: '',
    status: 'active',
  });

  const loadData = () => {
    setLoading(true);
    const allUsers = userService.getAll();
    const allLogs = userService.getLogs();
    const allStats = userService.getStats();
    
    let filteredUsers = allUsers;
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
    }
    
    setUsers(filteredUsers);
    setLogs(allLogs);
    setStats(allStats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, roleFilter]);

  // Handle Add User
  const handleAddUser = (e) => {
    e.preventDefault();
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('❌ Password must be at least 6 characters!');
      return;
    }
    
    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      department: formData.department,
      phone: formData.phone,
      status: formData.status,
    };
    
    userService.create(newUser);
    toast.success(`✅ User ${formData.name} added successfully!`);
    setShowAddUser(false);
    setFormData({ name: '', email: '', password: '', role: 'agent', department: 'Sales', phone: '', status: 'active' });
    loadData();
  };

  // Handle Edit User
  const handleEditUser = (e) => {
    e.preventDefault();
    userService.update(selectedUser.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      phone: formData.phone,
      status: formData.status,
    });
    toast.success(`✅ User ${formData.name} updated successfully!`);
    setShowEditUser(false);
    setSelectedUser(null);
    loadData();
  };

  // Handle Delete User
  const handleDeleteUser = () => {
    if (userToDelete) {
      userService.delete(userToDelete.id);
      toast.success(`🗑️ User ${userToDelete.name} deleted successfully!`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadData();
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department,
      phone: user.phone || '',
      status: user.status,
    });
    setShowEditUser(true);
  };

  // Export Users to CSV
  const exportUsersToCSV = () => {
    const dataToExport = users.length > 0 ? users : userService.getAll();
    const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Phone', 'Joined Date'];
    const rows = dataToExport.map(user => [
      user.name,
      user.email,
      user.role,
      user.department,
      user.status,
      user.phone || '',
      user.joinedDate || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📥 Users exported successfully!');
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      admin: 'text-red-600 bg-red-50 border-red-200',
      manager: 'text-blue-600 bg-blue-50 border-blue-200',
      agent: 'text-green-600 bg-green-50 border-green-200',
      viewer: 'text-gray-600 bg-gray-50 border-gray-200',
    };
    return colors[role] || colors.viewer;
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-gray-500 bg-gray-50 border-gray-200';
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color = 'primary', onClick, clickable = false }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 ${clickable ? 'cursor-pointer hover:shadow-soft-lg hover:border-primary/30 transition-all' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}/10`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>⚙️</span> Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage users, roles, and system settings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportUsersToCSV}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            📥 Export Users
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            ➕ Add User
          </button>
        </div>
      </div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard 
          title="📊 Total Users" 
          value={stats?.total || 0} 
          icon={Users} 
          color="primary"
          onClick={() => { setRoleFilter('all'); setSearchTerm(''); }}
          clickable={true}
        />
        <StatCard 
          title="✅ Active" 
          value={stats?.active || 0} 
          icon={UserCheck} 
          color="green-500"
          onClick={() => { setRoleFilter('all'); setSearchTerm('active'); }}
          clickable={true}
        />
        <StatCard 
          title="❌ Inactive" 
          value={stats?.inactive || 0} 
          icon={UserX} 
          color="gray-500"
          onClick={() => { setRoleFilter('all'); setSearchTerm('inactive'); }}
          clickable={true}
        />
        <StatCard 
          title="🛡️ Admins" 
          value={stats?.admins || 0} 
          icon={Shield} 
          color="red-500"
          onClick={() => { setRoleFilter('admin'); setSearchTerm(''); }}
          clickable={true}
        />
        <StatCard 
          title="👔 Managers" 
          value={stats?.managers || 0} 
          icon={Users} 
          color="blue-500"
          onClick={() => { setRoleFilter('manager'); setSearchTerm(''); }}
          clickable={true}
        />
        <StatCard 
          title="🤝 Agents" 
          value={stats?.agents || 0} 
          icon={Users} 
          color="green-500"
          onClick={() => { setRoleFilter('agent'); setSearchTerm(''); }}
          clickable={true}
        />
        <StatCard 
          title="👁️ Viewers" 
          value={stats?.viewers || 0} 
          icon={Eye} 
          color="gray-500"
          onClick={() => { setRoleFilter('viewer'); setSearchTerm(''); }}
          clickable={true}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>👥</span> User Management
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="🔍 Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">📊 All Roles</option>
              <option value="admin">🛡️ Admin</option>
              <option value="manager">👔 Manager</option>
              <option value="agent">🤝 Agent</option>
              <option value="viewer">👁️ Viewer</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">👤 User</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 hidden md:table-cell">📧 Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">🎭 Role</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 hidden sm:table-cell">📌 Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">⚡ Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      <span className="text-4xl block mb-2">📭</span>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500 md:hidden">{user.email}</p>
                            <p className="text-xs text-gray-500 sm:hidden">{user.status}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Showing {users.length} of {stats?.total || 0} users
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-800">⚙️ System Settings</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🏢 Company</span>
                <span className="text-sm font-medium text-gray-800">{settings.companyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">💱 Currency</span>
                <span className="text-sm font-medium text-gray-800">{settings.defaultCurrency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🔐 2FA Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${settings.enable2FA ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {settings.enable2FA ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">⏱️ Session Timeout</span>
                <span className="text-sm font-medium text-gray-800">{settings.sessionTimeout} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🔧 Maintenance</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${settings.maintenanceMode ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {settings.maintenanceMode ? '⚠️ Active' : '✅ Off'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-800">📈 Recent Activity</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{log.user}</span>
                      {' '}{log.action}{' '}
                      <span className="text-gray-500">{log.target}</span>
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                ➕ Add New User
              </h2>
              <button onClick={() => setShowAddUser(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👤 Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📧 Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🔒 Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🎭 Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="admin">🛡️ Admin</option>
                  <option value="manager">👔 Manager</option>
                  <option value="agent">🤝 Agent</option>
                  <option value="viewer">👁️ Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🏢 Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Management</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📱 Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📌 Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  ✅ Add User
                </button>
                <button type="button" onClick={() => setShowAddUser(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                ✏️ Edit User
              </h2>
              <button onClick={() => setShowEditUser(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👤 Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📧 Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🎭 Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="admin">🛡️ Admin</option>
                  <option value="manager">👔 Manager</option>
                  <option value="agent">🤝 Agent</option>
                  <option value="viewer">👁️ Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🏢 Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Management">Management</option>
                  <option value="Support">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📱 Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📌 Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  ✅ Update User
                </button>
                <button type="button" onClick={() => setShowEditUser(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🗑️ Delete User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{userToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDeleteUser} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;