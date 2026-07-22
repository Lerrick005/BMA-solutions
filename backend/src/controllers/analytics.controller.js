const Lead = require('../models/Lead');

const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const closedWon = await Lead.countDocuments({ status: 'Closed Won' });
    
    const leads = await Lead.find();
    const totalValue = leads.reduce((sum, lead) => {
      const rate = {
        USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1570, KES: 128,
        ZAR: 18.5, CAD: 1.36, AUD: 1.52, JPY: 149.5, CNY: 7.22,
      };
      const inUSD = lead.value / (rate[lead.currency] || 1);
      return sum + inUSD;
    }, 0);
    
    const conversionRate = totalLeads > 0 ? (closedWon / totalLeads) * 100 : 0;
    
    res.json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        closedWon,
        totalValue: Math.round(totalValue * 100) / 100,
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMonthlyTrends = async (req, res) => {
  try {
    const leads = await Lead.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          leads: { $sum: 1 },
          conversions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Closed Won'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    
    const monthlyData = leads.map((item) => ({
      month: new Date(item._id.year, item._id.month - 1, 1).toLocaleString('default', { month: 'short' }),
      leads: item.leads,
      conversions: item.conversions,
    }));
    
    res.json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStatusDistribution = async (req, res) => {
  try {
    const distribution = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 },
        },
      },
    ]);
    
    const colors = {
      'New': '#3b82f6',
      'Contacted': '#f59e0b',
      'Qualified': '#8b5cf6',
      'Proposal': '#f97316',
      'Closed Won': '#16a34a',
      'Closed Lost': '#ef4444',
    };
    
    const data = distribution.map((item) => ({
      name: item._id || 'Unknown',
      value: item.value,
      color: colors[item._id] || '#6b7280',
    }));
    
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getConversionFunnel = async (req, res) => {
  try {
    const funnel = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    
    const statusOrder = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won'];
    const total = funnel.reduce((sum, item) => sum + item.count, 0);
    
    const data = statusOrder.map((status) => {
      const found = funnel.find((item) => item._id === status);
      const count = found ? found.count : 0;
      return {
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });
    
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getMonthlyTrends,
  getStatusDistribution,
  getConversionFunnel,
};