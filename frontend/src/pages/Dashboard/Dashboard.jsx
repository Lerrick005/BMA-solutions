import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ArrowRight,
  PlusCircle,
  Mail,
  Calendar,
  CheckSquare,
  RefreshCw,
  X
} from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import StatusBadge from '../../components/common/StatusBadge';
import QuickActionButton from '../../components/common/QuickActionButton';
import CurrencyConverter from '../../components/common/CurrencyConverter';
import { kpiData, recentLeads, recentActivity } from '../../data/mockData';
import { convertCurrency, formatCurrency, exchangeRates } from '../../utils/currency';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [leads, setLeads] = useState(recentLeads);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);

  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    value: '',
    currency: 'USD',
    status: 'New'
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });

  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    attendees: '',
    notes: ''
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const totalValueInUSD = leads.reduce((total, lead) => {
    return total + convertCurrency(lead.value, lead.currency, 'USD');
  }, 0);

  const handleRefreshRates = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newRates = { ...exchangeRates };
      const currencies = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR', 'CAD', 'AUD', 'JPY', 'CNY'];
      
      currencies.forEach(currency => {
        if (currency !== 'USD') {
          const fluctuation = 1 + (Math.random() * 0.04 - 0.02);
          newRates[currency] = Math.round((exchangeRates[currency] * fluctuation) * 100) / 100;
        }
      });
      
      Object.assign(exchangeRates, newRates);
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      toast.success('📊 Exchange rates refreshed successfully!');
    }, 1500);
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    const newLeadData = {
      id: leads.length + 1,
      name: newLead.name,
      company: newLead.company,
      email: newLead.email,
      status: newLead.status,
      value: parseFloat(newLead.value) || 0,
      currency: newLead.currency,
      date: new Date().toISOString(),
      avatar: newLead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    setLeads([newLeadData, ...leads]);
    toast.success(`✅ Lead ${newLead.name} added successfully!`);
    setShowAddLeadModal(false);
    setNewLead({ name: '', company: '', email: '', value: '', currency: 'USD', status: 'New' });
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    toast.success(`✅ Task "${newTask.title}" created successfully!`);
    setShowCreateTaskModal(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    toast.success(`📧 Email sent to ${emailData.to} successfully!`);
    setShowSendEmailModal(false);
    setEmailData({ to: '', subject: '', message: '' });
  };

  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    toast.success(`📅 Meeting "${meetingData.title}" scheduled successfully!`);
    setShowScheduleMeetingModal(false);
    setMeetingData({ title: '', date: '', time: '', attendees: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🏠</span> Dashboard
          </h1>
          <p className="text-gray-500 mt-1">👋 Welcome back, Brian! Here's what's happening with your leads.</p>
          {lastRefreshed && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span>🔄</span> Last updated: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddLeadModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            ➕ Add New Lead
          </button>
          <button 
            onClick={handleRefreshRates}
            disabled={isRefreshing}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '🔄 Refreshing...' : '📊 Refresh Rates'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="📊 Total Leads"
          value={leads.length}
          icon={Users}
          trend={kpiData.leadsTrend}
          trendLabel="vs last month"
          color="primary"
        />
        <KPICard
          title="✨ New Leads (This Month)"
          value={leads.filter(l => l.status === 'New').length}
          icon={UserPlus}
          trend={kpiData.leadsTrend}
          trendLabel="vs last month"
          color="blue-500"
        />
        <KPICard
          title="🎯 Conversion Rate"
          value={`${kpiData.conversionRate}%`}
          icon={TrendingUp}
          trend={kpiData.conversionTrend}
          trendLabel="vs last month"
          color="purple-500"
        />
        <KPICard
          title="💰 Total Pipeline Value"
          value={formatCurrency(totalValueInUSD, 'USD')}
          icon={DollarSign}
          trend={8.7}
          trendLabel="vs last month"
          color="orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>📋</span> Recent Leads 
              <span className="ml-2 text-sm font-normal text-gray-400">({leads.length} total)</span>
            </h2>
            <button 
              onClick={() => window.location.href = '/leads'}
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
            >
              👁️ View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No leads yet. Click "Add New Lead" to get started!</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Lead</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 hidden sm:table-cell">Company</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 hidden md:table-cell">Value</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 hidden md:table-cell">In USD</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 5).map((lead) => {
                    const usdValue = convertCurrency(lead.value, lead.currency, 'USD');
                    return (
                      <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                              {lead.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                              <p className="text-xs text-gray-500 sm:hidden">{lead.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 hidden sm:table-cell">
                          <p className="text-sm text-gray-600">{lead.company}</p>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <p className="text-sm font-medium text-gray-800">
                            {formatCurrency(lead.value, lead.currency)}
                          </p>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <p className="text-sm text-gray-600">
                            {formatCurrency(usdValue, 'USD')}
                          </p>
                          {lead.currency !== 'USD' && (
                            <p className="text-xs text-gray-400">
                              Rate: 1 {lead.currency} = {(1 / exchangeRates[lead.currency]).toFixed(4)} USD
                            </p>
                          )}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <p className="text-sm text-gray-500">{formatTimeAgo(lead.date)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {leads.length > 5 && (
              <div className="text-center py-2 text-sm text-gray-400">
                Showing 5 of {leads.length} leads
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionButton
                label="➕ Add Lead"
                icon={UserPlus}
                color="primary"
                onClick={() => setShowAddLeadModal(true)}
              />
              <QuickActionButton
                label="✅ Create Task"
                icon={CheckSquare}
                color="blue-500"
                onClick={() => setShowCreateTaskModal(true)}
              />
              <QuickActionButton
                label="📧 Send Email"
                icon={Mail}
                color="purple-500"
                onClick={() => setShowSendEmailModal(true)}
              />
              <QuickActionButton
                label="📅 Schedule Meeting"
                icon={Calendar}
                color="orange-500"
                onClick={() => setShowScheduleMeetingModal(true)}
              />
            </div>
          </div>

          <CurrencyConverter />

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>📈</span> Recent Activity
              </h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="text-gray-500">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span>🕐</span> {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                ➕ Add New Lead
              </h2>
              <button onClick={() => setShowAddLeadModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👤 Full Name *</label>
                <input type="text" required value={newLead.name} onChange={(e) => setNewLead({...newLead, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🏢 Company *</label>
                <input type="text" required value={newLead.company} onChange={(e) => setNewLead({...newLead, company: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Acme Inc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📧 Email *</label>
                <input type="email" required value={newLead.email} onChange={(e) => setNewLead({...newLead, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="john@acme.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">💰 Value</label>
                  <input type="number" value={newLead.value} onChange={(e) => setNewLead({...newLead, value: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="10000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">💱 Currency</label>
                  <select value={newLead.currency} onChange={(e) => setNewLead({...newLead, currency: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="USD">💵 USD</option>
                    <option value="EUR">💶 EUR</option>
                    <option value="GBP">💷 GBP</option>
                    <option value="NGN">₦ NGN</option>
                    <option value="KES">🇰🇪 KES</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📌 Status</label>
                <select value={newLead.status} onChange={(e) => setNewLead({...newLead, status: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="New">🟢 New</option>
                  <option value="Contacted">📞 Contacted</option>
                  <option value="Qualified">⭐ Qualified</option>
                  <option value="Proposal">📄 Proposal</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  ✅ Add Lead
                </button>
                <button type="button" onClick={() => setShowAddLeadModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                ✅ Create Task
              </h2>
              <button onClick={() => setShowCreateTaskModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📝 Task Title *</label>
                <input type="text" required value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Follow up with client" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📄 Description</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Task details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">⚡ Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">📅 Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  ✅ Create Task
                </button>
                <button type="button" onClick={() => setShowCreateTaskModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showSendEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-500" />
                📧 Send Email
              </h2>
              <button onClick={() => setShowSendEmailModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📧 To *</label>
                <input type="email" required value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="client@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📝 Subject *</label>
                <input type="text" required value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Proposal Update" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📄 Message *</label>
                <textarea required value={emailData.message} onChange={(e) => setEmailData({...emailData, message: e.target.value})} rows="4" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Your message here..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  📤 Send Email
                </button>
                <button type="button" onClick={() => setShowSendEmailModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                📅 Schedule Meeting
              </h2>
              <button onClick={() => setShowScheduleMeetingModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleMeeting} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📝 Meeting Title *</label>
                <input type="text" required value={meetingData.title} onChange={(e) => setMeetingData({...meetingData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Client Meeting" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">📅 Date *</label>
                  <input type="date" required value={meetingData.date} onChange={(e) => setMeetingData({...meetingData, date: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">🕐 Time *</label>
                  <input type="time" required value={meetingData.time} onChange={(e) => setMeetingData({...meetingData, time: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">👥 Attendees</label>
                <input type="text" value={meetingData.attendees} onChange={(e) => setMeetingData({...meetingData, attendees: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="john@example.com, jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📄 Notes</label>
                <textarea value={meetingData.notes} onChange={(e) => setMeetingData({...meetingData, notes: e.target.value})} rows="2" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Meeting agenda..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  ✅ Schedule Meeting
                </button>
                <button type="button" onClick={() => setShowScheduleMeetingModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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

export default Dashboard;