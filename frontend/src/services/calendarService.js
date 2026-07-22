// Calendar Service - Handles events and meetings

let events = [
  {
    id: 1,
    title: 'Client Meeting - TechFlow Inc.',
    description: 'Review proposal and pricing details',
    date: new Date(),
    time: '10:00 AM',
    duration: 60,
    attendees: ['Sarah Johnson', 'Brian Arika'],
    location: 'Conference Room A',
    type: 'meeting',
    color: '#16a34a',
  },
  {
    id: 2,
    title: 'Demo Call - CloudSphere Solutions',
    description: 'Product demo for CloudSphere team',
    date: new Date(Date.now() + 86400000),
    time: '2:30 PM',
    duration: 45,
    attendees: ['Michael Chen', 'Jane Smith'],
    location: 'Virtual (Zoom)',
    type: 'demo',
    color: '#3b82f6',
  },
  {
    id: 3,
    title: 'Follow-up Call - DataVault Systems',
    description: 'Follow up on proposal',
    date: new Date(Date.now() + 172800000),
    time: '11:00 AM',
    duration: 30,
    attendees: ['Emily Rodriguez', 'Brian Arika'],
    location: 'Phone Call',
    type: 'call',
    color: '#8b5cf6',
  },
];

let idCounter = events.length + 1;

export const calendarService = {
  // Get all events
  getAllEvents: () => {
    return [...events];
  },

  // Get events for a specific date
  getEventsForDate: (date) => {
    const targetDate = new Date(date);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === targetDate.getDate() &&
             eventDate.getMonth() === targetDate.getMonth() &&
             eventDate.getFullYear() === targetDate.getFullYear();
    });
  },

  // Get events for a specific month
  getEventsForMonth: (year, month) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  },

  // Create new event
  createEvent: (eventData) => {
    const newEvent = {
      id: idCounter++,
      ...eventData,
    };
    events.push(newEvent);
    return newEvent;
  },

  // Update event
  updateEvent: (id, updates) => {
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      return events[index];
    }
    return null;
  },

  // Delete event
  deleteEvent: (id) => {
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events.splice(index, 1);
      return true;
    }
    return false;
  },

  // Get event types
  getEventTypes: () => {
    return ['meeting', 'demo', 'call', 'task', 'reminder'];
  },

  // Get color for event type
  getEventColor: (type) => {
    const colors = {
      'meeting': '#16a34a',
      'demo': '#3b82f6',
      'call': '#8b5cf6',
      'task': '#f59e0b',
      'reminder': '#ef4444',
    };
    return colors[type] || '#6b7280';
  },
};

export default calendarService;