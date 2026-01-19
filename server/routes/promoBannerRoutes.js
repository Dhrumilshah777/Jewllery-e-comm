const express = require('express');
const router = express.Router();
const { getPromoBanner, updatePromoBanner } = require('../controllers/promoBannerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getPromoBanner);
router.put('/', protect, admin, updatePromoBanner);

module.exports = router;
