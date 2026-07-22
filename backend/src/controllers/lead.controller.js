const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');

const getLeads = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      sort = { [req.query.sortBy]: req.query.sortOrder === 'asc' ? 1 : -1 };
    }
    
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort(sort);
    
    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }
    
    res.json({
      success: true,
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, company, email, phone, status, value, currency, source, notes, assignedTo, nextFollowUp } = req.body;
    
    const lead = await Lead.create({
      name,
      company,
      email,
      phone: phone || '',
      status: status || 'New',
      value,
      currency: currency || 'USD',
      source: source || 'Other',
      notes: notes || '',
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      nextFollowUp: nextFollowUp || null,
    });
    
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'lead_created',
      target: lead.name,
      details: `Created lead from ${lead.company}`,
      type: 'lead',
    });
    
    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      lead: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const { name, company, email, phone, status, value, currency, source, notes, assignedTo, nextFollowUp } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }
    
    const oldStatus = lead.status;
    
    if (name) lead.name = name;
    if (company) lead.company = company;
    if (email) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (status) lead.status = status;
    if (value !== undefined) lead.value = value;
    if (currency) lead.currency = currency;
    if (source) lead.source = source;
    if (notes !== undefined) lead.notes = notes;
    if (assignedTo) lead.assignedTo = assignedTo;
    if (nextFollowUp !== undefined) lead.nextFollowUp = nextFollowUp;
    
    await lead.save();
    
    let details = 'Updated lead';
    if (oldStatus !== status) {
      details = `Changed status from ${oldStatus} to ${status}`;
    }
    
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'lead_updated',
      target: lead.name,
      details,
      type: 'lead',
    });
    
    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      lead: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }
    
    const leadName = lead.name;
    await lead.deleteOne();
    
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'lead_deleted',
      target: leadName,
      details: 'Lead removed from system',
      type: 'lead',
    });
    
    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLeadStats = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'New' });
    const contacted = await Lead.countDocuments({ status: 'Contacted' });
    const qualified = await Lead.countDocuments({ status: 'Qualified' });
    const proposal = await Lead.countDocuments({ status: 'Proposal' });
    const closedWon = await Lead.countDocuments({ status: 'Closed Won' });
    const closedLost = await Lead.countDocuments({ status: 'Closed Lost' });
    
    const leads = await Lead.find();
    const totalValue = leads.reduce((sum, lead) => {
      const rate = {
        USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1570, KES: 128,
        ZAR: 18.5, CAD: 1.36, AUD: 1.52, JPY: 149.5, CNY: 7.22,
      };
      const inUSD = lead.value / (rate[lead.currency] || 1);
      return sum + inUSD;
    }, 0);
    
    const conversionRate = total > 0 ? (closedWon / total) * 100 : 0;
    
    res.json({
      success: true,
      stats: {
        total,
        newLeads,
        contacted,
        qualified,
        proposal,
        closedWon,
        closedLost,
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

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
};