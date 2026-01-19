const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const slideRoutes = require('./routes/slideRoutes');
const popularCategoryRoutes = require('./routes/popularCategoryRoutes');
const homeBannerRoutes = require('./routes/homeBannerRoutes');
const promoBannerRoutes = require('./routes/promoBannerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 30 * 24 * 60 * 60,
    collectionName: 'sessions',
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/popular-categories', popularCategoryRoutes);
app.use('/api/home-banner', homeBannerRoutes);
app.use('/api/promo-banner', promoBannerRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
