const PopularCategory = require('../models/PopularCategory');

// @desc    Fetch all popular categories
// @route   GET /api/popular-categories
// @access  Public
const getPopularCategories = async (req, res) => {
  try {
    const categories = await PopularCategory.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a popular category
// @route   POST /api/popular-categories
// @access  Private/Admin
const createPopularCategory = async (req, res) => {
  const { name, image } = req.body;

  try {
    const category = new PopularCategory({
      name,
      image,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: 'Invalid category data' });
  }
};

// @desc    Delete a popular category
// @route   DELETE /api/popular-categories/:id
// @access  Private/Admin
const deletePopularCategory = async (req, res) => {
  try {
    const category = await PopularCategory.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPopularCategories,
  createPopularCategory,
  deletePopularCategory,
};
