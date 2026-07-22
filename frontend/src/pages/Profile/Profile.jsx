import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Calendar, 
  Edit2, 
  Save, 
  X,
  TrendingUp,
  CheckCircle,
  Trophy,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  Filter,
  Eye,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import statsService from '../../services/statsService';
import { recentLeads } from '../../data/mockData';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    leadsCreated: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    dealsWon: 0,
    dealsValue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  const [profile, setProfile] = useState({
    name: 'Brian Arika',
    email: 'brianarika4@gmail.com',
    phone: '+1 (555) 123-4567',
    position: 'CEO & Founder',
    department: 'Management',
    company: 'BMA Solutions',
    joinedDate: '2024-01-15',
    bio: 'Passionate about building innovative solutions and helping businesses grow.',
  });

  const [formData, setFormData] = useState(profile);

  // Load stats on mount
  useEffect(() => {
    const loadStats = () => {
      const allStats = statsService.getAllStats();
      setStats(allStats);

      // Get all leads as activity
      const allActivity = recentLeads.map(lead => ({
        id: lead.id,
        type: 'lead',
        title: `New lead: ${lead.name}`,
        description: `${lead.name} from ${lead.company}`,
        time: new Date(lead.date).toLocaleDateString(),
        status: lead.status,
        value: lead.value,
        currency: lead.currency,
        company: lead.company,
        email: lead.email,
      }));
      
      // Sort by date (newest first)
      allActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(allActivity);
      setFilteredActivity(allActivity);
    };
    loadStats();
  }, []);

  // Filter activity based on status
  const filterActivity = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredActivity(recentActivity);
    } else if (filter === 'won') {
      setFilteredActivity(recentActivity.filter(item => item.status === 'Closed Won'));
    } else {
      setFilteredActivity(recentActivity.filter(item => item.status === filter));
    }
  };

  // Show deals/leads in modal
  const showItems = (items, title) => {
    setSelectedDeals(items);
    setModalTitle(title);
    setShowDealsModal(true);
  };

  // Handle stat click
  const handleStatClick = (type) => {
    if (type === 'leads') {
      const leads = recentLeads;
      showItems(leads, '📊 All Leads');
      filterActivity('all');
    } else if (type === 'tasks') {
      toast.info('📋 Tasks feature coming soon!');
    } else if (type === 'deals') {
      const deals = recentLeads.filter(lead => lead.status === 'Closed Won');
      showItems(deals, '🏆 Deals Won');
      filterActivity('won');
    } else if (type === 'value') {
      const deals = recentLeads.filter(lead => lead.status === 'Closed Won');
      showItems(deals, '💵 Deals Value Breakdown');
      filterActivity('won');
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const ProfileField = ({ icon: Icon, label, value, field }) => (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        {isEditing ? (
          <input
            type="text"
            value={formData[field]}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            className="w-full mt-1 px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        ) : (
          <p className="text-sm font-medium text-gray-800">{value || 'Not set'}</p>
        )}
      </div>
    </div>
  );

  // Stat Card Component - CLICKABLE
  const StatCard = ({ title, value, icon: Icon, subtitle, color = 'primary', onClick, clickable = false }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 text-center transition-all ${
        clickable ? 'cursor-pointer hover:shadow-soft-lg hover:border-primary/30 hover:scale-[1.02]' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-full bg-${color}/10 flex items-center justify-center mx-auto mb-3`}>
        <Icon className={`w-6 h-6 text-${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {clickable && (
        <span className="text-xs text-primary mt-2 inline-block">Click to view →</span>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>👤</span> My Profile
          </h1>
          <p className="text-gray-500 mt-1">View and manage your personal information</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                💾 Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-500">{profile.position}</p>
            <p className="text-sm text-gray-400 mt-1">{profile.company}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="p-6 divide-y divide-gray-100">
          <ProfileField icon={User} label="Full Name" value={profile.name} field="name" />
          <ProfileField icon={Mail} label="Email Address" value={profile.email} field="email" />
          <ProfileField icon={Phone} label="Phone Number" value={profile.phone} field="phone" />
          <ProfileField icon={Briefcase} label="Position" value={profile.position} field="position" />
          <ProfileField icon={Building} label="Department" value={profile.department} field="department" />
          <ProfileField icon={Building} label="Company" value={profile.company} field="company" />
          <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Joined Date</p>
              <p className="text-sm font-medium text-gray-800">{new Date(profile.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Bio</p>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="3"
                  className="w-full mt-1 px-3 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              ) : (
                <p className="text-sm text-gray-600">{profile.bio || 'No bio set'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - CLICKABLE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="📊 Leads Created"
          value={stats.leadsCreated}
          icon={BarChart3}
          subtitle={`${recentLeads.filter(l => l.status === 'New').length} new this month`}
          color="primary"
          onClick={() => handleStatClick('leads')}
          clickable={true}
        />
        <StatCard
          title="✅ Tasks Completed"
          value={stats.tasksCompleted}
          icon={CheckCircle}
          subtitle={`${stats.totalTasks - stats.tasksCompleted} pending`}
          color="green-500"
          onClick={() => handleStatClick('tasks')}
          clickable={true}
        />
        <StatCard
          title="🏆 Deals Won"
          value={stats.dealsWon}
          icon={Trophy}
          subtitle={`${formatCurrency(stats.dealsValue)} total value`}
          color="orange-500"
          onClick={() => handleStatClick('deals')}
          clickable={true}
        />
        <StatCard
          title="💵 Total Value"
          value={formatCurrency(stats.dealsValue)}
          icon={DollarSign}
          subtitle={`${stats.dealsWon} deals won`}
          color="blue-500"
          onClick={() => handleStatClick('value')}
          clickable={true}
        />
      </div>

      {/* Recent Activity with Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            📋 Recent Activity
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => filterActivity('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📊 All
            </button>
            <button
              onClick={() => filterActivity('New')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === 'New' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🟢 New
            </button>
            <button
              onClick={() => filterActivity('Contacted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === 'Contacted' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📞 Contacted
            </button>
            <button
              onClick={() => filterActivity('won')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === 'won' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🏆 Won
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No activity found</p>
          ) : (
            filteredActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'Closed Won' ? 'bg-green-500' :
                  activity.status === 'New' ? 'bg-blue-500' :
                  activity.status === 'Contacted' ? 'bg-yellow-500' :
                  activity.status === 'Qualified' ? 'bg-purple-500' :
                  'bg-gray-400'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'Closed Won' ? 'bg-green-100 text-green-700' :
                      activity.status === 'New' ? 'bg-blue-100 text-blue-700' :
                      activity.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' :
                      activity.status === 'Qualified' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{activity.time}</span>
                    {activity.value && (
                      <span className="text-xs text-gray-400">
                        • {formatCurrency(activity.value, activity.currency)}
                      </span>
                    )}
                    <Link 
                      to="/leads" 
                      className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deals/Leads Modal */}
      {showDealsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
              <button 
                onClick={() => setShowDealsModal(false)} 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedDeals.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items found</p>
              ) : (
                <div className="space-y-3">
                  {selectedDeals.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.company}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{formatCurrency(item.value, item.currency)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'Closed Won' ? 'bg-green-100 text-green-700' :
                          item.status === 'New' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                        <Link 
                          to="/leads" 
                          className="block text-xs text-primary hover:text-primary-dark mt-1"
                        >
                          View in Leads →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;