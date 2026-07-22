import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, DollarSign, Target, ArrowUp, ArrowDown } from 'lucide-react';
import leadService from '../../services/leadService';
import { formatCurrency } from '../../utils/currency';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthlyData = [
    { month: 'Jan', leads: 65, conversions: 12 },
    { month: 'Feb', leads: 78, conversions: 18 },
    { month: 'Mar', leads: 90, conversions: 22 },
    { month: 'Apr', leads: 82, conversions: 20 },
    { month: 'May', leads: 95, conversions: 25 },
    { month: 'Jun', leads: 110, conversions: 30 },
    { month: 'Jul', leads: 105, conversions: 28 },
    { month: 'Aug', leads: 120, conversions: 35 },
    { month: 'Sep', leads: 115, conversions: 32 },
    { month: 'Oct', leads: 130, conversions: 38 },
    { month: 'Nov', leads: 145, conversions: 42 },
    { month: 'Dec', leads: 160, conversions: 48 },
  ];

  const statusData = [
    { name: 'New', value: 25 },
    { name: 'Contacted', value: 30 },
    { name: 'Qualified', value: 20 },
    { name: 'Proposal', value: 15 },
    { name: 'Closed Won', value: 8 },
    { name: 'Closed Lost', value: 2 },
  ];

  const COLORS = ['#16a34a', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

  const categoryData = [
    { name: 'Technology', value: 35 },
    { name: 'Finance', value: 20 },
    { name: 'Healthcare', value: 15 },
    { name: 'Retail', value: 12 },
    { name: 'Manufacturing', value: 10 },
    { name: 'Other', value: 8 },
  ];

  useEffect(() => {
    const loadStats = () => {
      const statsData = leadService.getStats();
      setStats(statsData);
      setLoading(false);
    };
    loadStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendLabel }) => {
    const isPositive = trend > 0;
    return (
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className="p-3 rounded-lg bg-brand-green/10">
            <Icon className="w-5 h-5 text-brand-green" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {trend}%
            </span>
            <span className="text-sm text-gray-500">{trendLabel}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-green border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads" value={stats?.total || 0} icon={Users} trend={12.5} trendLabel="vs last month" />
        <StatCard title="Conversion Rate" value={`${stats?.conversionRate?.toFixed(1) || 0}%`} icon={Target} trend={3.2} trendLabel="vs last month" />
        <StatCard title="Closed Won" value={stats?.closedWon || 0} icon={TrendingUp} trend={8.7} trendLabel="vs last month" />
        <StatCard title="Total Pipeline Value" value={formatCurrency(stats?.totalValue || 0, 'USD')} icon={DollarSign} trend={15.3} trendLabel="vs last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Leads & Conversions</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#16a34a" />
                <Bar dataKey="conversions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Categories</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Leads</span>
                <span className="font-medium text-gray-800">{stats?.total || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Qualified</span>
                <span className="font-medium text-gray-800">{stats?.qualified || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${((stats?.qualified || 0) / (stats?.total || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Proposal</span>
                <span className="font-medium text-gray-800">{stats?.proposal || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${((stats?.proposal || 0) / (stats?.total || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Closed Won</span>
                <span className="font-medium text-gray-800">{stats?.closedWon || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-brand-green h-4 rounded-full" style={{ width: `${((stats?.closedWon || 0) / (stats?.total || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lead Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-800">{stats?.newLeads || 0}</p>
            <p className="text-xs text-gray-500">New</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-800">{stats?.contacted || 0}</p>
            <p className="text-xs text-gray-500">Contacted</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-800">{stats?.qualified || 0}</p>
            <p className="text-xs text-gray-500">Qualified</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-800">{stats?.proposal || 0}</p>
            <p className="text-xs text-gray-500">Proposal</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{stats?.closedWon || 0}</p>
            <p className="text-xs text-gray-500">Closed Won</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{stats?.closedLost || 0}</p>
            <p className="text-xs text-gray-500">Closed Lost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;