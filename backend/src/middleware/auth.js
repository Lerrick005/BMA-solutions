const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.status === 'inactive' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive or suspended',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`,
      });
    }
    next();
  };
};

const hasPermission = (permission) => {
  return (req, res, next) => {
    const rolePermissions = {
      admin: ['all'],
      manager: ['view_leads', 'edit_leads', 'view_analytics', 'view_users', 'edit_users', 'export_data'],
      agent: ['view_leads', 'edit_leads', 'view_analytics'],
      viewer: ['view_leads', 'view_analytics'],
    };

    const permissions = rolePermissions[req.user.role] || [];
    if (permissions.includes('all') || permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
  };
};

module.exports = { protect, restrictTo, hasPermission };