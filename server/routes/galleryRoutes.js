const express = require('express');
const router = express.Router();
const {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem,
  toggleWishlist,
} = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getGalleryItems)
  .post(protect, admin, createGalleryItem);

router.route('/:id/wishlist')
  .post(protect, toggleWishlist);

router.route('/:id')
  .delete(protect, admin, deleteGalleryItem);

module.exports = router;
