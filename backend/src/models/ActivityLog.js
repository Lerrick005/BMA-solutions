const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login', 'logout', 'lead_created', 'lead_updated', 'lead_deleted',
        'lead_status_changed', 'user_created', 'user_updated', 'user_deleted',
        'role_changed', 'settings_updated', 'export_data', 'import_data',
      ],
    },
    target: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['auth', 'lead', 'user', 'system', 'export', 'import'],
      required: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);