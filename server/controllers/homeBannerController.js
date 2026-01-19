const HomeBanner = require('../models/HomeBanner');

// @desc    Get home banner (single document)
// @route   GET /api/home-banner
// @access  Public
const getHomeBanner = async (req, res) => {
  try {
    const banner = await HomeBanner.findOne({});
    if (!banner) {
      return res.json(null);
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create or update home banner
// @route   PUT /api/home-banner
// @access  Private/Admin
const upsertHomeBanner = async (req, res) => {
  const {
    leftImage,
    leftTitle,
    leftSubtitle,
    leftLink,
    rightImage,
    rightTitle,
    rightSubtitle,
    rightLink,
  } = req.body;

  try {
    const existing = await HomeBanner.findOne({});
    if (existing) {
      existing.leftImage = leftImage ?? existing.leftImage;
      existing.leftTitle = leftTitle ?? existing.leftTitle;
      existing.leftSubtitle = leftSubtitle ?? existing.leftSubtitle;
      existing.leftLink = leftLink ?? existing.leftLink;
      existing.rightImage = rightImage ?? existing.rightImage;
      existing.rightTitle = rightTitle ?? existing.rightTitle;
      existing.rightSubtitle = rightSubtitle ?? existing.rightSubtitle;
      existing.rightLink = rightLink ?? existing.rightLink;
      const updated = await existing.save();
      return res.json(updated);
    }

    const created = await HomeBanner.create({
      leftImage,
      leftTitle,
      leftSubtitle,
      leftLink,
      rightImage,
      rightTitle,
      rightSubtitle,
      rightLink,
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: 'Invalid banner data' });
  }
};

module.exports = {
  getHomeBanner,
  upsertHomeBanner,
};

