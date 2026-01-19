const mongoose = require('mongoose');

const popularCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const PopularCategory = mongoose.model('PopularCategory', popularCategorySchema);

module.exports = PopularCategory;
