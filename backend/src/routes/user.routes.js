const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require('../controllers/user.controller');

router.use(protect);

router.get('/stats', restrictTo('admin'), getUserStats);
router.post('/', restrictTo('admin'), createUser);
router.delete('/:id', restrictTo('admin'), deleteUser);
router.get('/', restrictTo('admin', 'manager'), getUsers);
router.get('/:id', restrictTo('admin', 'manager'), getUser);
router.put('/:id', restrictTo('admin', 'manager'), updateUser);

module.exports = router;