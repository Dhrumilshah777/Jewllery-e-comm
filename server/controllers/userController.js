const User = require('../models/User');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const setSessionUserId = (req, userId) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError);
      req.session.userId = userId.toString();
      req.session.save((saveError) => {
        if (saveError) return reject(saveError);
        resolve();
      });
    });
  });

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password,
      phone,
      otp,
      otpExpires,
      isVerified: false
    });

    if (user) {
      // Send OTP via Email
      const message = `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Account Verification Code',
          message,
        });

        // Keep logging for dev purposes in case email fails or is slow
        console.log(`[DEV LOG] OTP for ${email} is: ${otp}`);

        res.status(200).json({
          message: 'OTP sent to email successfully',
          userId: user._id,
          phone: user.phone,
          email: user.email
        });
      } catch (error) {
        console.error('Email send error:', error);
        // If email fails, delete the user so they can try again
        await User.findByIdAndDelete(user._id);
        res.status(500).json({ message: 'Email could not be sent. Check server configuration.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify OTP and Activate User
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isVerified) {
       res.status(400).json({ message: 'User already verified' });
       return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    if (user.otpExpires < Date.now()) {
      res.status(400).json({ message: 'OTP expired' });
      return;
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    await setSessionUserId(req, user);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      await setSessionUserId(req, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Google login
// @route   POST /api/users/google
// @access  Public
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      await setSessionUserId(req, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    } else {
      // Create new user
      // Password is required by schema, so generate a random one
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        name,
        email,
        password: randomPassword,
      });

      await setSessionUserId(req, user);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Google login failed' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wishlist: user.wishlist
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ message: 'Invalid Product ID' });
    return;
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (user.wishlist.some(id => id.toString() === productId)) {
        res.status(400).json({ message: 'Product already in wishlist' });
        return;
      }
      user.wishlist.push(productId);
      await user.save();
      res.json({ message: 'Product added to wishlist' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  const productId = req.params.id;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ message: 'Invalid Product ID' });
    return;
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      res.json({ message: 'Product removed from wishlist' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  addToWishlist,
  removeFromWishlist,
  googleLogin
};
