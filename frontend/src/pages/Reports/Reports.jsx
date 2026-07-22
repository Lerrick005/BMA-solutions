import { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  File,
  X,
  Check,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Settings
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { recentLeads } from '../../data/mockData';
import { convertCurrency, formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reportType, setReportType] = useState('leads');
  const [dateRange, setDateRange] = useState('this-month');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    status: true,
    topLeads: true,
    currency: true,
    trends: true,
    allLeads: false
  });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');
  const reportRef = useRef(null);

  const dateRanges = [
    { value: 'today', label: '📅 Today' },
    { value: 'this-week', label: '📅 This Week' },
    { value: 'this-month', label: '📅 This Month' },
    { value: 'last-month', label: '📅 Last Month' },
    { value: 'this-quarter', label: '📅 This Quarter' },
    { value: 'this-year', label: '📅 This Year' },
  ];

  const reportTypes = [
    { value: 'leads', label: '📊 Lead Report', icon: Users, color: 'blue' },
    { value: 'analytics', label: '📈 Analytics Report', icon: TrendingUp, color: 'purple' },
    { value: 'performance', label: '🏆 Performance Report', icon: BarChart3, color: 'orange' },
    { value: 'financial', label: '💰 Financial Report', icon: DollarSign, color: 'green' },
  ];

  const generateReport = () => {
    setLoading(true);
    setShowPreview(false);
    
    setTimeout(() => {
      let leads = [...recentLeads];
      
      const now = new Date();
      let filteredLeads = leads;
      
      switch(dateRange) {
        case 'today':
          filteredLeads = leads.filter(l => new Date(l.date).toDateString() === now.toDateString());
          break;
        case 'this-week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          filteredLeads = leads.filter(l => new Date(l.date) >= weekStart);
          break;
        case 'this-month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          filteredLeads = leads.filter(l => new Date(l.date) >= monthStart);
          break;
        case 'last-month':
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          filteredLeads = leads.filter(l => {
            const d = new Date(l.date);
            return d >= lastMonthStart && d <= lastMonthEnd;
          });
          break;
        case 'this-quarter':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          filteredLeads = leads.filter(l => new Date(l.date) >= quarterStart);
          break;
        case 'this-year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          filteredLeads = leads.filter(l => new Date(l.date) >= yearStart);
          break;
        default:
          filteredLeads = leads;
      }

      if (selectedStatus !== 'all') {
        filteredLeads = filteredLeads.filter(l => l.status === selectedStatus);
      }

      filteredLeads.sort((a, b) => {
        let valA, valB;
        if (sortBy === 'value') {
          valA = convertCurrency(a.value, a.currency, 'USD');
          valB = convertCurrency(b.value, b.currency, 'USD');
        } else if (sortBy === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === 'company') {
          valA = a.company.toLowerCase();
          valB = b.company.toLowerCase();
        } else if (sortBy === 'status') {
          valA = a.status;
          valB = b.status;
        } else {
          valA = new Date(a.date);
          valB = new Date(b.date);
        }
        
        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });

      const totalLeads = filteredLeads.length;
      const totalValue = filteredLeads.reduce((sum, lead) => {
        return sum + convertCurrency(lead.value, lead.currency, 'USD');
      }, 0);
      
      const statusCounts = {};
      filteredLeads.forEach(lead => {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      });
      
      const currencyBreakdown = {};
      filteredLeads.forEach(lead => {
        currencyBreakdown[lead.currency] = (currencyBreakdown[lead.currency] || 0) + lead.value;
      });

      const monthlyTrends = {};
      filteredLeads.forEach(lead => {
        const month = new Date(lead.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyTrends[month]) {
          monthlyTrends[month] = { leads: 0, value: 0 };
        }
        monthlyTrends[month].leads++;
        monthlyTrends[month].value += convertCurrency(lead.value, lead.currency, 'USD');
      });

      const report = {
        generatedAt: new Date().toISOString(),
        dateRange: dateRange,
        totalLeads,
        totalValue: Math.round(totalValue * 100) / 100,
        statusCounts,
        currencyBreakdown,
        leads: filteredLeads,
        topLeads: [...filteredLeads].sort((a, b) => {
          const valA = convertCurrency(a.value, a.currency, 'USD');
          const valB = convertCurrency(b.value, b.currency, 'USD');
          return valB - valA;
        }).slice(0, 10),
        conversionRate: totalLeads > 0 ? 
          Math.round((filteredLeads.filter(l => l.status === 'Closed Won').length / totalLeads) * 100 * 10) / 10 : 0,
        averageValue: totalLeads > 0 ? Math.round((totalValue / totalLeads) * 100) / 100 : 0,
        monthlyTrends,
        statusDistribution: Object.keys(statusCounts).map(status => ({
          status,
          count: statusCounts[status],
          percentage: totalLeads > 0 ? Math.round((statusCounts[status] / totalLeads) * 100) : 0
        })),
      };

      setReportData(report);
      setShowPreview(true);
      setLoading(false);
      toast.success('✅ Report generated successfully!');
    }, 1500);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    
    toast.loading('📄 Generating PDF...');
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let remainingHeight = pdfHeight;
      let position = 0;
      
      while (remainingHeight > 0) {
        if (position > 0) {
          pdf.addPage();
        }
        const heightToAdd = Math.min(remainingHeight, pdf.internal.pageSize.getHeight());
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight);
        position += pdf.internal.pageSize.getHeight();
        remainingHeight -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.dismiss();
      toast.success('✅ PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('❌ Failed to generate PDF');
      console.error(error);
    }
  };

  const exportCSV = () => {
    if (!reportData) return;
    
    const headers = ['Name', 'Company', 'Email', 'Value', 'Currency', 'Status', 'Date'];
    const rows = reportData.leads.map(lead => [
      lead.name,
      lead.company,
      lead.email,
      lead.value,
      lead.currency,
      lead.status,
      new Date(lead.date).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📥 CSV exported successfully!');
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-700',
      'Contacted': 'bg-yellow-100 text-yellow-700',
      'Qualified': 'bg-purple-100 text-purple-700',
      'Proposal': 'bg-orange-100 text-orange-700',
      'Closed Won': 'bg-green-100 text-green-700',
      'Closed Lost': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      'New': '🟢',
      'Contacted': '📞',
      'Qualified': '⭐',
      'Proposal': '📄',
      'Closed Won': '🏆',
      'Closed Lost': '❌',
    };
    return emojis[status] || '📌';
  };

  const formatCurrencyValue = (amount, currency = 'USD') => {
    return formatCurrency(amount, currency);
  };

  const formatDateValue = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDateRangeLabel = () => {
    const range = dateRanges.find(r => r.value === dateRange);
    return range ? range.label : 'All Time';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>📊</span> Reports
          </h1>
          <p className="text-gray-500 mt-1">Generate and export reports</p>
        </div>
        <div className="flex gap-3">
          {showPreview && (
            <>
              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                📄 Export PDF
              </button>
              <button
                onClick={exportCSV}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                📊 Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              ⚙️ Report Settings
            </h2>
            
            <div className="space-y-4">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">📌 Report Type</label>
                <div className="space-y-2">
                  {reportTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReportType(type.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        reportType === type.value 
                          ? `bg-${type.color}-50 border-2 border-${type.color}-500 text-${type.color}-700` 
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-${type.color}-100 flex items-center justify-center`}>
                        <type.icon className={`w-4 h-4 text-${type.color}-500`} />
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">📅 Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">📌 Status Filter</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="all">📊 All Statuses</option>
                  <option value="New">🟢 New</option>
                  <option value="Contacted">📞 Contacted</option>
                  <option value="Qualified">⭐ Qualified</option>
                  <option value="Proposal">📄 Proposal</option>
                  <option value="Closed Won">🏆 Closed Won</option>
                  <option value="Closed Lost">❌ Closed Lost</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  >
                    <option value="value">💰 Value</option>
                    <option value="name">👤 Name</option>
                    <option value="company">🏢 Company</option>
                    <option value="status">📌 Status</option>
                    <option value="date">📅 Date</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  >
                    <option value="desc">⬇️ Descending</option>
                    <option value="asc">⬆️ Ascending</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>

              {/* Report Info */}
              {reportData && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    📊 {reportData.totalLeads} leads • {getDateRangeLabel()}
                  </p>
                  <p className="text-xs text-gray-400">
                    🕐 Generated: {new Date(reportData.generatedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          {showPreview && reportData ? (
            <div ref={reportRef} className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  📄 Report Preview
                </h2>
                <span className="text-xs text-gray-400">
                  {reportTypes.find(t => t.value === reportType)?.label} • {getDateRangeLabel()}
                </span>
              </div>

              {/* Report Header */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  {reportTypes.find(t => t.value === reportType)?.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {getDateRangeLabel()} • {reportData.totalLeads} leads analyzed
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Generated: {new Date(reportData.generatedAt).toLocaleString()}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('summary')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    📊 Summary
                  </h3>
                  {expandedSections.summary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">{reportData.totalLeads}</p>
                      <p className="text-xs text-gray-500">📊 Total Leads</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrencyValue(reportData.totalValue, 'USD')}
                      </p>
                      <p className="text-xs text-gray-500">💰 Total Value</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">{reportData.conversionRate}%</p>
                      <p className="text-xs text-gray-500">🎯 Conversion Rate</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrencyValue(reportData.averageValue, 'USD')}
                      </p>
                      <p className="text-xs text-gray-500">📊 Average Value</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Distribution */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('status')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-primary" />
                    📌 Status Distribution
                  </h3>
                  {expandedSections.status ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.status && (
                  <div className="mt-3 space-y-2">
                    {reportData.statusDistribution.map((item) => (
                      <div key={item.status} className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {getStatusEmoji(item.status)} {item.status}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: item.status === 'Closed Won' ? '#16a34a' :
                                             item.status === 'Closed Lost' ? '#ef4444' :
                                             item.status === 'Qualified' ? '#8b5cf6' :
                                             item.status === 'Proposal' ? '#f59e0b' :
                                             item.status === 'Contacted' ? '#fbbf24' :
                                             '#3b82f6'
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[60px] text-right">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Leads */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('topLeads')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    🏆 Top 10 Leads
                  </h3>
                  {expandedSections.topLeads ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.topLeads && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-gray-500">#</th>
                          <th className="text-left py-2 px-3 text-gray-500">Name</th>
                          <th className="text-left py-2 px-3 text-gray-500">Company</th>
                          <th className="text-left py-2 px-3 text-gray-500">Value</th>
                          <th className="text-left py-2 px-3 text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topLeads.map((lead, index) => (
                          <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-2 px-3 text-gray-500">#{index + 1}</td>
                            <td className="py-2 px-3 font-medium">{lead.name}</td>
                            <td className="py-2 px-3 text-gray-600">{lead.company}</td>
                            <td className="py-2 px-3 text-gray-600">
                              {formatCurrencyValue(lead.value, lead.currency)}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Currency Breakdown */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('currency')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    💱 Currency Breakdown
                  </h3>
                  {expandedSections.currency ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.currency && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(reportData.currencyBreakdown).map(([currency, amount]) => (
                      <span key={currency} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm border border-gray-200">
                        {currency}: {formatCurrencyValue(amount, currency)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly Trends */}
              {Object.keys(reportData.monthlyTrends).length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => toggleSection('trends')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      📈 Monthly Trends
                    </h3>
                    {expandedSections.trends ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.trends && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(reportData.monthlyTrends).map(([month, data]) => (
                        <div key={month} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                          <p className="text-xs font-medium text-gray-600">{month}</p>
                          <p className="text-sm font-bold text-gray-800">{data.leads} leads</p>
                          <p className="text-xs text-gray-500">{formatCurrencyValue(data.value, 'USD')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* All Leads Table */}
              <div>
                <button
                  onClick={() => toggleSection('allLeads')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    📋 All Leads ({reportData.leads.length})
                  </h3>
                  {expandedSections.allLeads ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.allLeads && (
                  <div className="mt-3 overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-gray-500">Name</th>
                          <th className="text-left py-2 px-3 text-gray-500">Company</th>
                          <th className="text-left py-2 px-3 text-gray-500">Value</th>
                          <th className="text-left py-2 px-3 text-gray-500">Status</th>
                          <th className="text-left py-2 px-3 text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-2 px-3 font-medium">{lead.name}</td>
                            <td className="py-2 px-3 text-gray-600">{lead.company}</td>
                            <td className="py-2 px-3 text-gray-600">
                              {formatCurrencyValue(lead.value, lead.currency)}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-500 text-xs">
                              {formatDateValue(lead.date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                  Report generated on {new Date(reportData.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">No Report Generated</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md">
                  Configure your report settings on the left and click "Generate Report"
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6 max-w-sm">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <span className="text-2xl block">📌</span>
                    <span className="text-xs text-gray-500">Select Report Type</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <span className="text-2xl block">📅</span>
                    <span className="text-xs text-gray-500">Choose Date Range</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <span className="text-2xl block">🔍</span>
                    <span className="text-xs text-gray-500">Apply Filters</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <span className="text-2xl block">📊</span>
                    <span className="text-xs text-gray-500">Generate Report</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;