const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  addToWishlist,
  removeFromWishlist,
  googleLogin
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/auth', authUser);
router.post('/google', googleLogin);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:id', protect, removeFromWishlist);

module.exports = router;
