// Mock data for the CRM dashboard with multi-currency support

// KPI Data
export const kpiData = {
  totalLeads: 1284,
  newLeadsThisMonth: 156,
  conversionRate: 24.8,
  revenue: '$48,392',
  activeDeals: 42,
  leadsTrend: 12.5,
  conversionTrend: 3.2,
  revenueTrend: 8.7,
};

// Recent Leads with different currencies
export const recentLeads = [
  {
    id: 1,
    name: 'Sarah Johnson',
    company: 'TechFlow Inc.',
    email: 'sarah.j@techflow.com',
    status: 'New',
    value: 12500,
    currency: 'USD',
    date: '2026-07-15T10:30:00',
    avatar: 'SJ',
  },
  {
    id: 2,
    name: 'Michael Chen',
    company: 'CloudSphere Solutions',
    email: 'm.chen@cloudsphere.com',
    status: 'Contacted',
    value: 7500,
    currency: 'EUR',
    date: '2026-07-15T09:15:00',
    avatar: 'MC',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    company: 'DataVault Systems',
    email: 'e.rodriguez@datavault.com',
    status: 'Qualified',
    value: 23000,
    currency: 'USD',
    date: '2026-07-14T16:45:00',
    avatar: 'ER',
  },
  {
    id: 4,
    name: 'James Wilson',
    company: 'SecureNet Technologies',
    email: 'j.wilson@securenet.com',
    status: 'Proposal',
    value: 2000000,
    currency: 'NGN',
    date: '2026-07-14T14:20:00',
    avatar: 'JW',
  },
  {
    id: 5,
    name: 'Amanda Lee',
    company: 'Apex Solutions',
    email: 'a.lee@apexsolutions.com',
    status: 'Closed Won',
    value: 31000,
    currency: 'USD',
    date: '2026-07-13T11:00:00',
    avatar: 'AL',
  },
  {
    id: 6,
    name: 'David Kim',
    company: 'InnovateTech',
    email: 'd.kim@innovatetech.com',
    status: 'Contacted',
    value: 850,
    currency: 'GBP',
    date: '2026-07-12T15:30:00',
    avatar: 'DK',
  },
  {
    id: 7,
    name: 'Maria Santos',
    company: 'Global Solutions Ltd',
    email: 'm.santos@globalsolutions.com',
    status: 'New',
    value: 45000,
    currency: 'CAD',
    date: '2026-07-12T11:00:00',
    avatar: 'MS',
  },
];

// Recent Activity Feed
export const recentActivity = [
  {
    id: 1,
    user: 'John Doe',
    action: 'added a new lead',
    target: 'Sarah Johnson from TechFlow Inc. ($12,500 USD)',
    timestamp: '2026-07-15T10:30:00',
    type: 'lead_added',
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'updated deal status',
    target: 'CloudSphere Solutions - moved to "Proposal"',
    timestamp: '2026-07-15T09:45:00',
    type: 'deal_updated',
  },
  {
    id: 3,
    user: 'Mike Thompson',
    action: 'closed a deal',
    target: 'Apex Solutions - $31,200',
    timestamp: '2026-07-14T16:30:00',
    type: 'deal_closed',
  },
  {
    id: 4,
    user: 'Emily Davis',
    action: 'sent a follow-up email',
    target: 'DataVault Systems',
    timestamp: '2026-07-14T14:15:00',
    type: 'email_sent',
  },
  {
    id: 5,
    user: 'Robert Chen',
    action: 'scheduled a meeting',
    target: 'SecureNet Technologies - Demo call',
    timestamp: '2026-07-13T13:00:00',
    type: 'meeting_scheduled',
  },
];

// Quick Actions
export const quickActions = [
  { id: 1, label: 'Add Lead', icon: 'UserPlus', color: 'brand-green' },
  { id: 2, label: 'Create Task', icon: 'CheckSquare', color: 'blue-500' },
  { id: 3, label: 'Send Email', icon: 'Mail', color: 'purple-500' },
  { id: 4, label: 'Schedule Meeting', icon: 'Calendar', color: 'orange-500' },
];

// Exchange rates for the currency converter (for display)
export const exchangeRatesDisplay = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1570,
  KES: 128,
  ZAR: 18.5,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.5,
  CNY: 7.22,
};