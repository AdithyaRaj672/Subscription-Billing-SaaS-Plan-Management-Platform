const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Lock down all subscription routes behind authentication
router.use(authenticateToken);

// Subscribe or upgrade plan (Tenant Admins & Super Admins)
router.post('/', requireRole('tenant_admin', 'super_admin'), subscriptionController.createOrUpdateSubscription);

// Get current tenant's subscription
router.get('/me', subscriptionController.getTenantSubscription);

// Set subscription to cancel at period end
router.post('/cancel', requireRole('tenant_admin', 'super_admin'), subscriptionController.cancelSubscription);

// Record feature usage
router.post('/usage', subscriptionController.recordUsage);

module.exports = router;