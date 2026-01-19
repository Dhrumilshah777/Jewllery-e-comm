const mongoose = require('mongoose');

const promoBannerSchema = new mongoose.Schema({
  panel1Image: { type: String, required: true },
  panel1Title: { type: String, required: true },
  panel1Link: { type: String, required: true },
  
  panel2Image: { type: String, required: true },
  panel2Title: { type: String, required: true },
  panel2Link: { type: String, required: true },

  panel3Image: { type: String, required: true },
  panel3Title: { type: String, required: true },
  panel3Link: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('PromoBanner', promoBannerSchema);
