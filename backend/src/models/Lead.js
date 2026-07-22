const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'],
      default: 'New',
    },
    value: {
      type: Number,
      required: [true, 'Lead value is required'],
      min: [0, 'Value cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR', 'CAD', 'AUD', 'JPY', 'CNY'],
      default: 'USD',
    },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'LinkedIn', 'Email', 'Phone', 'Other'],
      default: 'Other',
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nextFollowUp: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ company: 1 });

module.exports = mongoose.model('Lead', leadSchema);