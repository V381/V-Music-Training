const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  createUser, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');

router.post('/register', createUser);

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

module.exports = router;