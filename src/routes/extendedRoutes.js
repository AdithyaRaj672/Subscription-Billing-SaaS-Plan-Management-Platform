const express = require('express');
const router = express.Router();
const extendedController = require('../controllers/extendedController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Module 9: Coupons
router.post('/coupons', requireRole('tenant_admin', 'super_admin'), extendedController.createCoupon);
router.post('/invoices/apply-coupon', extendedController.applyCouponToInvoice);

// Module 10: Customer Dashboard
router.get('/customer/dashboard', extendedController.getCustomerDashboard);

// Module 11: Dunning Retry
router.post('/invoices/:invoiceId/retry', requireRole('tenant_admin', 'super_admin'), extendedController.retryFailedPayment);

// Module 12: MRR & Churn Report
router.get('/admin/reports/revenue', requireRole('tenant_admin', 'super_admin'), extendedController.getRevenueAndChurnReport);

module.exports = router;