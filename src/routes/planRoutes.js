const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Public routes (Customers can view pricing without login)
router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlanById);

// Protected Admin routes
router.post('/', authenticateToken, requireRole('tenant_admin', 'super_admin'), planController.createPlan);
router.put('/:id', authenticateToken, requireRole('tenant_admin', 'super_admin'), planController.updatePlan);
router.patch('/:id/status', authenticateToken, requireRole('tenant_admin', 'super_admin'), planController.togglePlanStatus);

module.exports = router;