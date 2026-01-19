const express = require('express');
const router = express.Router();
const {
  getPopularCategories,
  createPopularCategory,
  deletePopularCategory,
} = require('../controllers/popularCategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPopularCategories)
  .post(protect, admin, createPopularCategory);

router.route('/:id')
  .delete(protect, admin, deletePopularCategory);

module.exports = router;
