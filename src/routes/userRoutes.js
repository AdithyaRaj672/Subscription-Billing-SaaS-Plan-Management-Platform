const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

// Protected: Create user under tenant (Tenant Admins & Super Admins only)
router.post('/', authenticateToken, requireRole('tenant_admin', 'super_admin'), authController.registerUser);

module.exports = router;