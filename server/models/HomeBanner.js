const mongoose = require('mongoose');

const homeBannerSchema = mongoose.Schema(
  {
    leftImage: {
      type: String,
      required: true,
    },
    leftTitle: {
      type: String,
      required: true,
    },
    leftSubtitle: {
      type: String,
      required: true,
    },
    leftLink: {
      type: String,
      required: true,
    },
    rightImage: {
      type: String,
      required: true,
    },
    rightTitle: {
      type: String,
      required: true,
    },
    rightSubtitle: {
      type: String,
      required: true,
    },
    rightLink: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const HomeBanner = mongoose.model('HomeBanner', homeBannerSchema);

module.exports = HomeBanner;

