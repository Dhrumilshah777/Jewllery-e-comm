const Slide = require('../models/Slide');

// @desc    Fetch all slides
// @route   GET /api/slides
// @access  Public
const getSlides = async (req, res) => {
  try {
    const slides = await Slide.find({});
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a slide
// @route   POST /api/slides
// @access  Private/Admin
const createSlide = async (req, res) => {
  const { image, title, subtitle } = req.body;

  try {
    const slide = new Slide({
      image,
      title,
      subtitle,
    });

    const createdSlide = await slide.save();
    res.status(201).json(createdSlide);
  } catch (error) {
    res.status(400).json({ message: 'Invalid slide data' });
  }
};

// @desc    Update a slide
// @route   PUT /api/slides/:id
// @access  Private/Admin
const updateSlide = async (req, res) => {
  const { image, title, subtitle } = req.body;

  const slide = await Slide.findById(req.params.id);

  if (slide) {
    slide.image = image || slide.image;
    slide.title = title || slide.title;
    slide.subtitle = subtitle || slide.subtitle;

    const updatedSlide = await slide.save();
    res.json(updatedSlide);
  } else {
    res.status(404).json({ message: 'Slide not found' });
  }
};

// @desc    Delete a slide
// @route   DELETE /api/slides/:id
// @access  Private/Admin
const deleteSlide = async (req, res) => {
  const slide = await Slide.findById(req.params.id);

  if (slide) {
    await slide.deleteOne();
    res.json({ message: 'Slide removed' });
  } else {
    res.status(404).json({ message: 'Slide not found' });
  }
};

module.exports = {
  getSlides,
  createSlide,
  updateSlide,
  deleteSlide,
};
