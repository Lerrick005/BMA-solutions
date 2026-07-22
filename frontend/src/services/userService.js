
// User Service - Handles all user management operations

import { usersData, systemLogs, currentUser, systemSettings } from '../data/usersData';

// Generate unique ID
const generateId = () => {
  return Math.max(...usersData.map(u => u.id), 0) + 1;
};

// User service with CRUD operations
export const userService = {
  // Get all users
  getAll: () => {
    return [...usersData];
  },

  // Get user by ID
  getById: (id) => {
    return usersData.find(user => user.id === id);
  },

  // Get users by role
  getByRole: (role) => {
    return usersData.filter(user => user.role === role);
  },

  // Create new user
  create: (userData) => {
    const newUser = {
      id: generateId(),
      ...userData,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      status: 'active',
    };
    usersData.push(newUser);
    
    systemLogs.unshift({
      id: systemLogs.length + 1,
      user: currentUser.name,
      action: 'Added new user',
      target: userData.name,
      timestamp: new Date().toISOString(),
      type: 'user_added',
      details: `Added as ${userData.role}`,
    });
    
    return newUser;
  },

  // Update user
  update: (id, updates) => {
    const index = usersData.findIndex(user => user.id === id);
    if (index !== -1) {
      usersData[index] = { ...usersData[index], ...updates };
      
      systemLogs.unshift({
        id: systemLogs.length + 1,
        user: currentUser.name,
        action: 'Updated user',
        target: usersData[index].name,
        timestamp: new Date().toISOString(),
        type: 'user_updated',
        details: `Changed role to ${updates.role || 'updated'}`,
      });
      
      return usersData[index];
    }
    return null;
  },

  // Delete user
  delete: (id) => {
    const index = usersData.findIndex(user => user.id === id);
    if (index !== -1) {
      const userName = usersData[index].name;
      usersData.splice(index, 1);
      
      systemLogs.unshift({
        id: systemLogs.length + 1,
        user: currentUser.name,
        action: 'Deleted user',
        target: userName,
        timestamp: new Date().toISOString(),
        type: 'user_deleted',
        details: 'User removed from system',
      });
      
      return true;
    }
    return false;
  },

  // Get system logs
  getLogs: (limit = 20) => {
    return systemLogs.slice(0, limit);
  },

  // Get statistics
  getStats: () => {
    const total = usersData.length;
    const active = usersData.filter(u => u.status === 'active').length;
    const inactive = usersData.filter(u => u.status === 'inactive').length;
    const admins = usersData.filter(u => u.role === 'admin').length;
    const managers = usersData.filter(u => u.role === 'manager').length;
    const agents = usersData.filter(u => u.role === 'agent').length;
    const viewers = usersData.filter(u => u.role === 'viewer').length;
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    const recentActivity = systemLogs.filter(log => 
      new Date(log.timestamp) > sevenDaysAgo
    ).length;

    return {
      total,
      active,
      inactive,
      admins,
      managers,
      agents,
      viewers,
      recentActivity,
    };
  },

  // Update system settings
  updateSettings: (settings) => {
    Object.assign(systemSettings, settings);
    return systemSettings;
  },

  // Get system settings
  getSettings: () => {
    return { ...systemSettings };
  },

  // Check if user has permission
  hasPermission: (userRole, permission) => {
    const rolePermissions = {
      admin: ['all'],
      manager: ['view_dashboard', 'view_leads', 'edit_leads', 'view_analytics', 'view_users', 'edit_users', 'export_data'],
      agent: ['view_dashboard', 'view_leads', 'edit_leads', 'view_analytics'],
      viewer: ['view_dashboard', 'view_leads', 'view_analytics'],
    };
    
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes('all') || permissions.includes(permission);
  },
};

export default userService;