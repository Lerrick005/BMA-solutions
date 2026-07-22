// Lead Service - Handles all lead operations with mock data

import { recentLeads } from '../data/mockData';
import { convertCurrency } from '../utils/currency';

// Generate unique ID
const generateId = () => {
  return Math.max(...recentLeads.map(l => l.id), 0) + 1;
};

// Lead service with CRUD operations
export const leadService = {
  // Get all leads with optional filters
  getAll: (filters = {}) => {
    let leads = [...recentLeads];
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      leads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.company.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (filters.status && filters.status !== 'All') {
      leads = leads.filter(lead => lead.status === filters.status);
    }
    
    // Sort
    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || 'asc';
      leads.sort((a, b) => {
        let valA = a[filters.sortBy];
        let valB = b[filters.sortBy];
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        
        return 0;
      });
    }
    
    return leads;
  },
  
  // Get lead by ID
  getById: (id) => {
    return recentLeads.find(lead => lead.id === id);
  },
  
  // Create new lead
  create: (leadData) => {
    const newLead = {
      id: generateId(),
      ...leadData,
      date: new Date().toISOString(),
      avatar: leadData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    };
    recentLeads.push(newLead);
    return newLead;
  },
  
  // Update lead
  update: (id, updates) => {
    const index = recentLeads.findIndex(lead => lead.id === id);
    if (index !== -1) {
      recentLeads[index] = { ...recentLeads[index], ...updates };
      return recentLeads[index];
    }
    return null;
  },
  
  // Delete lead
  delete: (id) => {
    const index = recentLeads.findIndex(lead => lead.id === id);
    if (index !== -1) {
      recentLeads.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Get statistics
  getStats: () => {
    const leads = recentLeads;
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'New').length;
    const contacted = leads.filter(l => l.status === 'Contacted').length;
    const qualified = leads.filter(l => l.status === 'Qualified').length;
    const proposal = leads.filter(l => l.status === 'Proposal').length;
    const closedWon = leads.filter(l => l.status === 'Closed Won').length;
    const closedLost = leads.filter(l => l.status === 'Closed Lost').length;
    
    const totalValue = leads.reduce((sum, lead) => {
      return sum + convertCurrency(lead.value, lead.currency, 'USD');
    }, 0);
    
    return {
      total,
      newLeads,
      contacted,
      qualified,
      proposal,
      closedWon,
      closedLost,
      totalValue,
      conversionRate: total > 0 ? (closedWon / total * 100) : 0,
    };
  }
};

export default leadService;