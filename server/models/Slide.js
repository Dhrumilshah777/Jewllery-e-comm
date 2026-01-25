const mongoose = require('mongoose');

const slideSchema = mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

const Slide = mongoose.model('Slide', slideSchema);

module.exports = Slide;
