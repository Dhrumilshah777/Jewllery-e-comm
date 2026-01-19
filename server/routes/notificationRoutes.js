const express = require('express');
const router = express.Router();
const { subscribe, sendNotification, getVapidKey } = require('../controllers/notificationController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/subscribe', optionalAuth, subscribe); 
router.post('/send', sendNotification); // Should be admin protected later
router.get('/vapid-key', getVapidKey);

module.exports = router;
