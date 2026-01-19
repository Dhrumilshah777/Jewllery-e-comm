const express = require('express');
const router = express.Router();
const { getHomeBanner, upsertHomeBanner } = require('../controllers/homeBannerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getHomeBanner).put(protect, admin, upsertHomeBanner);

module.exports = router;

