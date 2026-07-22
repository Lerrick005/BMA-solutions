import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye
} from 'lucide-react';
import taskService from '../../services/taskService';
import { usersData } from '../../data/usersData';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
  });

  const statusOptions = ['all', 'pending', 'in-progress', 'completed'];
  const priorityOptions = ['all', 'low', 'medium', 'high'];
  const statusLabels = {
    'pending': '🟡 Pending',
    'in-progress': '🔵 In Progress',
    'completed': '🟢 Completed',
  };

  // Load all tasks
  const loadTasks = () => {
    setLoading(true);
    const allTasks = taskService.getAll();
    setTasks(allTasks);
    const allStats = taskService.getStats();
    setStats(allStats);
    setFilteredTasks(allTasks);
    setLoading(false);
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  // Load on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, priorityFilter, tasks]);

  // Handle stat card click - filters tasks
  const handleStatClick = (filterType, filterValue) => {
    if (filterType === 'all' && filterValue === 'all') {
      clearFilters();
      return;
    }
    
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    
    if (filterType === 'status') {
      setStatusFilter(filterValue);
    } else if (filterType === 'priority') {
      setPriorityFilter(filterValue);
    }
    
    setShowStats(filterType + '-' + filterValue);
    setTimeout(() => setShowStats(null), 2000);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    toast.info('🧹 Filters cleared!');
  };

  // Refresh data - resets everything
  const refreshData = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    loadTasks();
    toast.success('🔄 Tasks refreshed successfully!');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    const newTask = {
      title: formData.title,
      description: formData.description,
      assignedTo: parseInt(formData.assignedTo),
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
    };
    taskService.create(newTask);
    toast.success('✅ Task created successfully!');
    setShowAddModal(false);
    setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', status: 'pending', dueDate: '' });
    loadTasks();
  };

  const handleEditTask = (e) => {
    e.preventDefault();
    taskService.update(selectedTask.id, {
      title: formData.title,
      description: formData.description,
      assignedTo: parseInt(formData.assignedTo),
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
    });
    toast.success('✅ Task updated successfully!');
    setShowEditModal(false);
    setSelectedTask(null);
    loadTasks();
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      taskService.delete(taskToDelete.id);
      toast.success('🗑️ Task deleted successfully!');
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      loadTasks();
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo.toString(),
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
    });
    setShowEditModal(true);
  };

  const handleStatusChange = (taskId, newStatus) => {
    taskService.update(taskId, { status: newStatus });
    toast.success(`📋 Task status updated!`);
    loadTasks();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (task) => {
    if (task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  const getPriorityColor = (priority) => {
    return {
      'low': 'bg-green-100 text-green-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-red-100 text-red-700',
    } [priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    return {
      'pending': 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
    } [status] || 'bg-gray-100 text-gray-700';
  };

  // Stat Card Component - CLICKABLE
  const StatCard = ({ title, value, icon: Icon, color = 'primary', filterType, filterValue }) => (
    <button
      onClick={() => handleStatClick(filterType, filterValue)}
      className={`bg-white rounded-xl shadow-soft border p-4 text-center transition-all hover:shadow-soft-lg hover:border-primary/30 hover:scale-[1.02] w-full ${
        showStats === filterType + '-' + filterValue ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'
      }`}
    >
      <div className={`w-10 h-10 rounded-full bg-${color}/10 flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{title}</p>
      {showStats === filterType + '-' + filterValue && (
        <span className="text-xs text-primary font-medium">✓ Filtered</span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading tasks...</p>
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
            <span>📋</span> Task Management
          </h1>
          <p className="text-gray-500 mt-1">Manage and track all your tasks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ➕ Add Task
        </button>
      </div>

      {/* Stats Cards - CLICKABLE */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard 
          title="📊 Total" 
          value={stats?.total || 0} 
          icon={Clock} 
          color="primary"
          filterType="all"
          filterValue="all"
        />
        <StatCard 
          title="🟡 Pending" 
          value={stats?.pending || 0} 
          icon={Clock} 
          color="yellow-500"
          filterType="status"
          filterValue="pending"
        />
        <StatCard 
          title="🔵 In Progress" 
          value={stats?.inProgress || 0} 
          icon={Clock} 
          color="blue-500"
          filterType="status"
          filterValue="in-progress"
        />
        <StatCard 
          title="🟢 Completed" 
          value={stats?.completed || 0} 
          icon={CheckCircle} 
          color="green-500"
          filterType="status"
          filterValue="completed"
        />
        <StatCard 
          title="🔴 Overdue" 
          value={stats?.overdue || 0} 
          icon={AlertCircle} 
          color="red-500"
          filterType="status"
          filterValue="overdue"
        />
        <StatCard 
          title="🔴 High Priority" 
          value={stats?.highPriority || 0} 
          icon={AlertCircle} 
          color="red-500"
          filterType="priority"
          filterValue="high"
        />
        <StatCard 
          title="📈 Completion Rate" 
          value={`${stats?.completionRate || 0}%`} 
          icon={CheckCircle} 
          color="primary"
          filterType="all"
          filterValue="all"
        />
      </div>

      {/* Active Filter Indicator */}
      {(statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-primary">
            🔍 Filtered by: 
            {statusFilter !== 'all' && ` Status: ${statusLabels[statusFilter]}`}
            {priorityFilter !== 'all' && ` Priority: ${priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}`}
            {searchTerm && ` Search: "${searchTerm}"`}
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            ✕ Clear Filters
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">📌 All Status</option>
            <option value="pending">🟡 Pending</option>
            <option value="in-progress">🔵 In Progress</option>
            <option value="completed">🟢 Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">⚡ All Priority</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
          <button
            onClick={refreshData}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">📝 Task</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden md:table-cell">👤 Assigned To</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">⚡ Priority</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">📌 Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">📅 Due Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">⚡ Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    <span className="text-4xl block mb-2">📭</span>
                    No tasks found. Create a new task to get started!
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const overdue = isOverdue(task);
                  const user = usersData.find(u => u.id === task.assignedTo);
                  return (
                    <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                            {user?.avatar || '?'}
                          </div>
                          <span className="text-sm text-gray-600">{user?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary/20 ${getStatusColor(task.status)}`}
                        >
                          <option value="pending">🟡 Pending</option>
                          <option value="in-progress">🔵 In Progress</option>
                          <option value="completed">🟢 Completed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            {formatDate(task.dueDate)}
                            {overdue && ' 🔴'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-wrap gap-2">
          <p className="text-sm text-gray-500">Showing {filteredTasks.length} of {tasks.length} tasks</p>
          <button onClick={refreshData} className="text-sm text-primary hover:text-primary-dark font-medium">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                ➕ Add New Task
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📝 Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📄 Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Task description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👤 Assign To</label>
                <select
                  required
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select user...</option>
                  {usersData.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">⚡ Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">📌 Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="in-progress">🔵 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📅 Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  ✅ Add Task
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                ✏️ Edit Task
              </h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📝 Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📄 Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👤 Assign To</label>
                <select
                  required
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {usersData.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">⚡ Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">📌 Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="in-progress">🔵 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📅 Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  ✅ Update Task
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🗑️ Delete Task</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{taskToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDeleteTask} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
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

export default Tasks;