import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import calendarService from '../../services/calendarService';
import toast from 'react-hot-toast';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    attendees: '',
    location: '',
    type: 'meeting',
    color: '#16a34a',
  });

  // Load events
  const loadEvents = () => {
    setLoading(true);
    const allEventsData = calendarService.getAllEvents();
    setAllEvents(allEventsData);
    setEvents(allEventsData);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filter events by type
  const filterEvents = (filterType) => {
    setActiveFilter(filterType);
    if (filterType === 'all') {
      setEvents(allEvents);
    } else if (filterType === 'upcoming') {
      const now = new Date();
      setEvents(allEvents.filter(e => new Date(e.date) >= now));
    } else {
      setEvents(allEvents.filter(e => e.type === filterType));
    }
  };

  // Get days in current month
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // Get events for a day
  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    });
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Handle day click
  const handleDayClick = (day) => {
    setSelectedDate(day);
    const dayEvents = getEventsForDay(day);
    setSelectedEvents(dayEvents);
    setShowEventDetail(true);
  };

  // Handle add event
  const handleAddEvent = (e) => {
    e.preventDefault();
    
    const date = new Date(formData.date);
    const timeParts = formData.time.split(':');
    date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));

    const newEvent = {
      title: formData.title,
      description: formData.description,
      date: date,
      time: formData.time,
      duration: parseInt(formData.duration),
      attendees: formData.attendees.split(',').map(a => a.trim()).filter(a => a),
      location: formData.location,
      type: formData.type,
      color: formData.color || calendarService.getEventColor(formData.type),
    };

    calendarService.createEvent(newEvent);
    toast.success('✅ Event created successfully!');
    setShowEventModal(false);
    resetForm();
    loadEvents();
  };

  // Handle edit event
  const handleEditEvent = (e) => {
    e.preventDefault();
    
    const date = new Date(formData.date);
    const timeParts = formData.time.split(':');
    date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));

    const updatedEvent = {
      title: formData.title,
      description: formData.description,
      date: date,
      time: formData.time,
      duration: parseInt(formData.duration),
      attendees: formData.attendees.split(',').map(a => a.trim()).filter(a => a),
      location: formData.location,
      type: formData.type,
      color: formData.color || calendarService.getEventColor(formData.type),
    };

    calendarService.updateEvent(selectedEvent.id, updatedEvent);
    toast.success('✅ Event updated successfully!');
    setShowEventModal(false);
    setEditMode(false);
    resetForm();
    loadEvents();
  };

  // Handle delete event
  const handleDeleteEvent = (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    calendarService.deleteEvent(eventId);
    toast.success('🗑️ Event deleted successfully!');
    setShowEventDetail(false);
    loadEvents();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 30,
      attendees: '',
      location: '',
      type: 'meeting',
      color: '#16a34a',
    });
    setSelectedEvent(null);
    setEditMode(false);
  };

  // Open edit modal
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      time: event.time || '09:00',
      duration: event.duration || 30,
      attendees: event.attendees ? event.attendees.join(', ') : '',
      location: event.location || '',
      type: event.type || 'meeting',
      color: event.color || '#16a34a',
    });
    setEditMode(true);
    setShowEventModal(true);
    setShowEventDetail(false);
  };

  // Get event type icon
  const getEventTypeIcon = (type) => {
    const icons = {
      'meeting': '🤝',
      'demo': '💻',
      'call': '📞',
      'task': '✅',
      'reminder': '🔔',
    };
    return icons[type] || '📌';
  };

  // Get event type label
  const getEventTypeLabel = (type) => {
    const labels = {
      'meeting': 'Meeting',
      'demo': 'Demo',
      'call': 'Call',
      'task': 'Task',
      'reminder': 'Reminder',
    };
    return labels[type] || type;
  };

  // Stat Card Component - CLICKABLE
  const StatCard = ({ title, value, icon: Icon, color = 'primary', filterType }) => (
    <button
      onClick={() => filterEvents(filterType)}
      className={`bg-white rounded-xl shadow-soft border p-4 text-center transition-all hover:shadow-soft-lg hover:border-primary/30 hover:scale-[1.02] w-full ${
        activeFilter === filterType ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-gray-100'
      }`}
    >
      <div className={`w-10 h-10 rounded-full bg-${color}/10 flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{title}</p>
      {activeFilter === filterType && (
        <span className="text-xs text-primary font-medium">✓ Active</span>
      )}
    </button>
  );

  // Get stats
  const getStats = () => {
    const total = allEvents.length;
    const upcoming = allEvents.filter(e => new Date(e.date) >= new Date()).length;
    const meetings = allEvents.filter(e => e.type === 'meeting').length;
    const demos = allEvents.filter(e => e.type === 'demo').length;
    return { total, upcoming, meetings, demos };
  };

  const stats = getStats();
  const days = getDaysInMonth();
  const monthName = format(currentDate, 'MMMM yyyy');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading calendar...</p>
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
            <span>📅</span> Calendar
          </h1>
          <p className="text-gray-500 mt-1">Schedule and manage your events</p>
          {activeFilter !== 'all' && (
            <span className="text-xs text-primary mt-1 inline-block">
              🔍 Filtered by: {activeFilter === 'upcoming' ? 'Upcoming' : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              <button 
                onClick={() => filterEvents('all')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ✕ Clear
              </button>
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadEvents}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            🔄 Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setShowEventModal(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            ➕ Add Event
          </button>
        </div>
      </div>

      {/* Stats Cards - CLICKABLE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="📊 Total Events" 
          value={stats.total} 
          icon={CalendarIcon} 
          color="primary"
          filterType="all"
        />
        <StatCard 
          title="📅 Upcoming Events" 
          value={stats.upcoming} 
          icon={CalendarIcon} 
          color="blue-500"
          filterType="upcoming"
        />
        <StatCard 
          title="🤝 Meetings" 
          value={stats.meetings} 
          icon={Users} 
          color="green-500"
          filterType="meeting"
        />
        <StatCard 
          title="💻 Demos" 
          value={stats.demos} 
          icon={Users} 
          color="purple-500"
          filterType="demo"
        />
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 p-2">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                className={`min-h-[100px] p-2 rounded-lg transition-all text-left ${
                  isCurrentMonth ? 'hover:bg-gray-50' : 'opacity-40'
                } ${isTodayDate ? 'bg-primary/10 border-2 border-primary' : 'border border-transparent'}`}
              >
                <span className={`text-sm font-medium ${isTodayDate ? 'text-primary' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-0.5 rounded truncate"
                      style={{ backgroundColor: event.color || '#16a34a', color: '#fff' }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-400">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventDetail && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <button onClick={() => setShowEventDetail(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">📭</span>
                  <p>No events on this day</p>
                  <button
                    onClick={() => {
                      setShowEventDetail(false);
                      setFormData({
                        ...formData,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                      });
                      setEditMode(false);
                      setShowEventModal(true);
                    }}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    ➕ Add Event
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border border-gray-100 hover:shadow-soft transition-all"
                      style={{ borderLeftColor: event.color || '#16a34a', borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getEventTypeIcon(event.type)} {getEventTypeLabel(event.type)}
                          </p>
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time} ({event.duration} min)
                            </span>
                            {event.attendees && event.attendees.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.attendees.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(event)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editMode ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-primary" />}
                {editMode ? '✏️ Edit Event' : '➕ Add New Event'}
              </h2>
              <button onClick={() => { setShowEventModal(false); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editMode ? handleEditEvent : handleAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📝 Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📄 Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Event description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">📅 Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">⏰ Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">⏱️ Duration (minutes)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📌 Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="meeting">🤝 Meeting</option>
                  <option value="demo">💻 Demo</option>
                  <option value="call">📞 Call</option>
                  <option value="task">✅ Task</option>
                  <option value="reminder">🔔 Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👥 Attendees</label>
                <input
                  type="text"
                  value={formData.attendees}
                  onChange={(e) => setFormData({...formData, attendees: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John Doe, Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📍 Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Conference Room A, Virtual"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  {editMode ? '✅ Update Event' : '✅ Add Event'}
                </button>
                <button type="button" onClick={() => { setShowEventModal(false); resetForm(); }} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;