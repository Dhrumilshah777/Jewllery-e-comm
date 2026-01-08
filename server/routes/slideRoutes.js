const express = require('express');
const router = express.Router();
const {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} = require('../controllers/slideController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getSlides).post(protect, admin, createSlide);
router
  .route('/:id')
  .put(protect, admin, updateSlide)
  .delete(protect, admin, deleteSlide);

module.exports = router;
