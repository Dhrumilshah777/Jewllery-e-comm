const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Slide = require('./models/Slide');

dotenv.config();

const slides = [
  {
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop",
    title: "Timeless Elegance",
    subtitle: "Discover our exquisite collection of handcrafted jewelry designed to make you shine."
  },
  {
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2070&auto=format&fit=crop",
    title: "Modern Luxury",
    subtitle: "Experience the perfect blend of contemporary design and classic beauty."
  },
  {
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2075&auto=format&fit=crop",
    title: "Shine Bright",
    subtitle: "Find the perfect piece to celebrate life's most special moments."
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await Slide.deleteMany({});
    await Slide.insertMany(slides);
    console.log('Slides Imported');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
