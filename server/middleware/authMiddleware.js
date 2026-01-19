const User = require('../models/User');

const protect = async (req, res, next) => {
  const userId = req.session?.userId;

  if (!userId) {
    res.status(401).json({ message: 'Not authorized, no session' });
    return;
  }

  try {
    req.user = await User.findById(userId).select('-password');

    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const optionalAuth = async (req, res, next) => {
  const userId = req.session?.userId;
  if (userId) {
    try {
      req.user = await User.findById(userId).select('-password');
    } catch (error) {
      console.error(error);
    }
  }
  next();
};

module.exports = { protect, admin, optionalAuth };
