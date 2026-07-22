// Stats Service - Calculates real stats from your data
import { recentLeads } from '../data/mockData';
import { leadService } from './leadService';

// Mock tasks data
const mockTasks = [
  { id: 1, title: 'Follow up with Sarah Johnson', completed: true },
  { id: 2, title: 'Send proposal to TechFlow Inc.', completed: true },
  { id: 3, title: 'Prepare Q3 report', completed: false },
  { id: 4, title: 'Demo call with CloudSphere', completed: true },
  { id: 5, title: 'Review contract', completed: false },
  { id: 6, title: 'Update CRM documentation', completed: true },
  { id: 7, title: 'Team meeting', completed: false },
  { id: 8, title: 'Client follow-up emails', completed: true },
];

// Mock deals won (Closed Won leads)
const getDealsWon = () => {
  return recentLeads.filter(lead => lead.status === 'Closed Won');
};

export const statsService = {
  // Get leads created count (total leads)
  getLeadsCreated: () => {
    return recentLeads.length;
  },

  // Get tasks completed count
  getTasksCompleted: () => {
    return mockTasks.filter(task => task.completed).length;
  },

  // Get total tasks
  getTotalTasks: () => {
    return mockTasks.length;
  },

  // Get deals won count
  getDealsWon: () => {
    return getDealsWon().length;
  },

  // Get total deals value
  getDealsValue: () => {
    const deals = getDealsWon();
    return deals.reduce((total, deal) => total + deal.value, 0);
  },

  // Get all stats in one object
  getAllStats: () => {
    return {
      leadsCreated: statsService.getLeadsCreated(),
      tasksCompleted: statsService.getTasksCompleted(),
      totalTasks: statsService.getTotalTasks(),
      dealsWon: statsService.getDealsWon(),
      dealsValue: statsService.getDealsValue(),
    };
  },

  // Get recent tasks
  getRecentTasks: () => {
    return mockTasks.slice(0, 5);
  },

  // Add a new task
  addTask: (task) => {
    const newTask = {
      id: mockTasks.length + 1,
      ...task,
      completed: false,
    };
    mockTasks.push(newTask);
    return newTask;
  },

  // Toggle task completion
  toggleTask: (id) => {
    const task = mockTasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      return task;
    }
    return null;
  },
};

export default statsService;