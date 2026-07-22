// Task Service - Handles all task operations

import { usersData } from '../data/usersData';

// Mock tasks data
let tasks = [
  {
    id: 1,
    title: 'Follow up with Sarah Johnson',
    description: 'Send proposal and pricing details for TechFlow Inc.',
    assignedTo: 1, // Brian Arika
    assignedToName: 'Brian Arika',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-07-20',
    createdAt: '2026-07-16T10:30:00',
    completedAt: null,
  },
  {
    id: 2,
    title: 'Demo call with CloudSphere Solutions',
    description: 'Prepare and deliver demo presentation for CloudSphere team',
    assignedTo: 2, // Jane Smith
    assignedToName: 'Jane Smith',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-07-22',
    createdAt: '2026-07-16T09:15:00',
    completedAt: null,
  },
  {
    id: 3,
    title: 'Review Q3 Sales Report',
    description: 'Analyze performance metrics and prepare summary',
    assignedTo: 1, // Brian Arika
    assignedToName: 'Brian Arika',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-07-15',
    createdAt: '2026-07-14T16:45:00',
    completedAt: '2026-07-15T10:00:00',
  },
  {
    id: 4,
    title: 'Update CRM Documentation',
    description: 'Update user manual with new features',
    assignedTo: 3, // Mike Thompson
    assignedToName: 'Mike Thompson',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-07-25',
    createdAt: '2026-07-13T11:00:00',
    completedAt: null,
  },
  {
    id: 5,
    title: 'Client Follow-up Emails',
    description: 'Send follow-up emails to all qualified leads',
    assignedTo: 2, // Jane Smith
    assignedToName: 'Jane Smith',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-07-18',
    createdAt: '2026-07-12T14:20:00',
    completedAt: null,
  },
];

// Generate unique ID
const generateId = () => {
  return Math.max(...tasks.map(t => t.id), 0) + 1;
};

// Get user by ID
const getUserById = (id) => {
  return usersData.find(u => u.id === id) || usersData[0];
};

// Task service
export const taskService = {
  // Get all tasks
  getAll: () => {
    return [...tasks];
  },

  // Get task by ID
  getById: (id) => {
    return tasks.find(task => task.id === id);
  },

  // Get tasks by status
  getByStatus: (status) => {
    return tasks.filter(task => task.status === status);
  },

  // Get tasks by priority
  getByPriority: (priority) => {
    return tasks.filter(task => task.priority === priority);
  },

  // Get tasks assigned to user
  getByUser: (userId) => {
    return tasks.filter(task => task.assignedTo === userId);
  },

  // Create new task
  create: (taskData) => {
    const user = getUserById(taskData.assignedTo);
    const newTask = {
      id: generateId(),
      ...taskData,
      assignedToName: user ? user.name : 'Unknown',
      status: taskData.status || 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    tasks.push(newTask);
    return newTask;
  },

  // Update task
  update: (id, updates) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      // If status is being changed to 'completed', set completedAt
      if (updates.status === 'completed' && tasks[index].status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      }
      // If status is changing from 'completed', clear completedAt
      if (updates.status !== 'completed' && tasks[index].status === 'completed') {
        updates.completedAt = null;
      }
      tasks[index] = { ...tasks[index], ...updates };
      return tasks[index];
    }
    return null;
  },

  // Delete task
  delete: (id) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      return true;
    }
    return false;
  },

  // Get task statistics
  getStats: () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
      if (t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length;
    const lowPriority = tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length;

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
};

export default taskService;