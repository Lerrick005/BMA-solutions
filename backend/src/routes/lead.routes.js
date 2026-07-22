const express = require('express');
const router = express.Router();
const { protect, hasPermission } = require('../middleware/auth');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
} = require('../controllers/lead.controller');

router.use(protect);

router.get('/stats', getLeadStats);
router.get('/', hasPermission('view_leads'), getLeads);
router.get('/:id', hasPermission('view_leads'), getLead);
router.post('/', hasPermission('edit_leads'), createLead);
router.put('/:id', hasPermission('edit_leads'), updateLead);
router.delete('/:id', hasPermission('delete_leads'), deleteLead);

module.exports = router;