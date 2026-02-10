const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document automatically deleted after 10 minutes (600 seconds)
  }
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
module.exports = PendingUser;
