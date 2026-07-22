const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../middleware/auth');
const {
  getDashboardStats,
  getMonthlyTrends,
  getStatusDistribution,
  getConversionFunnel,
} = require('../controllers/analytics.controller');

router.use(protect);
router.use(hasPermission('view_analytics'));

router.get('/dashboard', getDashboardStats);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/status-distribution', getStatusDistribution);
router.get('/conversion-funnel', getConversionFunnel);

module.exports = router;