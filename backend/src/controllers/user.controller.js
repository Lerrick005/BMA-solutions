const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const getUsers = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query).select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'agent',
      department: department || 'Sales',
      phone: phone || '',
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    });
    
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'user_created',
      target: user.name,
      details: `Created user with role: ${user.role}`,
      type: 'user',
    });
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, phone, status } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (phone) user.phone = phone;
    if (status) user.status = status;
    
    await user.save();
    
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'user_updated',
      target: user.name,
      details: 'Updated user details',
      type: 'user',
    });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }
    
    const userName = user.name;
    await user.deleteOne();
    
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'user_deleted',
      target: userName,
      details: 'User deleted from system',
      type: 'user',
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ status: 'active' });
    const inactive = await User.countDocuments({ status: 'inactive' });
    const suspended = await User.countDocuments({ status: 'suspended' });
    const admins = await User.countDocuments({ role: 'admin' });
    const managers = await User.countDocuments({ role: 'manager' });
    const agents = await User.countDocuments({ role: 'agent' });
    const viewers = await User.countDocuments({ role: 'viewer' });
    
    res.json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        suspended,
        admins,
        managers,
        agents,
        viewers,
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
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
};