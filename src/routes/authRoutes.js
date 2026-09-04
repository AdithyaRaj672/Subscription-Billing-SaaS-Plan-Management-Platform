const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Public
router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);

// Protected
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;