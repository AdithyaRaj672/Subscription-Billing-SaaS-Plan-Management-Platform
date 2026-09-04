const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken); // Lock down all routes behind authentication

// Tenant Invoices & Payments
router.post('/invoices', requireRole('tenant_admin', 'super_admin'), billingController.generateInvoice);
router.get('/invoices', billingController.getTenantInvoices);
router.post('/pay', requireRole('tenant_admin', 'super_admin', 'billing_manager'), billingController.processPayment);

// Executive Admin Analytics
router.get('/dashboard', requireRole('tenant_admin', 'super_admin'), billingController.getAdminDashboardMetrics);

module.exports = router;