const Gallery = require('../models/Gallery');

// @desc    Fetch all gallery items
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }

    const items = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a gallery item
// @route   POST /api/gallery
// @access  Private/Admin
const createGalleryItem = async (req, res) => {
  const { title, imageUrl, category } = req.body;

  try {
    const galleryItem = new Gallery({
      title,
      imageUrl,
      category: category || 'General',
    });

    const createdItem = await galleryItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: 'Invalid gallery data' });
  }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res) => {
  const item = await Gallery.findById(req.params.id);

  if (item) {
    await item.deleteOne();
    res.json({ message: 'Gallery item removed' });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};

// @desc    Toggle wishlist status (Global Exclusivity)
// @route   POST /api/gallery/:id/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();

  try {
    const item = await Gallery.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Case 1: Already wishlisted by someone else
    if (item.wishlistedBy && item.wishlistedBy.toString() !== userId) {
      return res.status(400).json({ message: 'Item already wishlisted by another user' });
    }

    // Case 2: Wishlisted by current user -> Unclaim
    if (item.wishlistedBy && item.wishlistedBy.toString() === userId) {
      item.wishlistedBy = null;
      await item.save();
      
      // Emit update event
      if (req.io) {
        req.io.emit('gallery:update', { id, wishlistedBy: null });
      }
      
      return res.json({ message: 'Removed from wishlist', wishlistedBy: null });
    }

    // Case 3: Not wishlisted -> Claim
    // Use findOneAndUpdate to handle race condition
    const updatedItem = await Gallery.findOneAndUpdate(
      { _id: id, wishlistedBy: null },
      { wishlistedBy: userId },
      { new: true }
    );

    if (!updatedItem) {
      // If update failed, it means someone else claimed it just now
      return res.status(400).json({ message: 'Item already wishlisted by another user' });
    }

    // Emit update event
    if (req.io) {
      req.io.emit('gallery:update', { id, wishlistedBy: userId });
    }

    res.json({ message: 'Added to wishlist', wishlistedBy: userId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getGalleryItems,
  createGalleryItem,
  deleteGalleryItem,
  toggleWishlist,
};
