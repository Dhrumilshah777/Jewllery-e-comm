const webpush = require('web-push');
const Subscription = require('../models/Subscription');
const dotenv = require('dotenv');

dotenv.config();

webpush.setVapidDetails(
  process.env.VAPID_MAILTO,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Public (or Private)
const subscribe = async (req, res) => {
  try {
    const subscription = req.body;
    
    // Check if subscription already exists
    const exists = await Subscription.findOne({ endpoint: subscription.endpoint });
    if (exists) {
      // Update user if logged in
      if (req.user && (!exists.user || exists.user.toString() !== req.user._id.toString())) {
        exists.user = req.user._id;
        await exists.save();
      }
      return res.status(200).json({ message: 'Subscription already exists', subscription: exists });
    }

    const newSubscription = new Subscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      user: req.user ? req.user._id : null
    });

    await newSubscription.save();

    res.status(201).json({ message: 'Subscribed successfully', subscription: newSubscription });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendPushToAll = async (payloadObj) => {
  const payload = JSON.stringify(payloadObj);
  const subscriptions = await Subscription.find({});
  
  if (subscriptions.length === 0) return;

  const notifications = subscriptions.map(sub => {
    return webpush.sendNotification({
      endpoint: sub.endpoint,
      keys: sub.keys
    }, payload).catch(err => {
      console.error('Error sending notification to', sub.endpoint, err);
      // If 410 Gone or 404 Not Found, delete the subscription
      if (err.statusCode === 410 || err.statusCode === 404) {
           Subscription.findOneAndDelete({ endpoint: sub.endpoint }).exec();
      }
    });
  });

  await Promise.all(notifications);
};

// @desc    Send push notification (Admin or Test)
// @route   POST /api/notifications/send
// @access  Private (Admin) - for now Public for testing
const sendNotification = async (req, res) => {
  try {
    const { title, message, url, icon } = req.body;
    await sendPushToAll({ title, message, url, icon });

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get VAPID Public Key
// @route   GET /api/notifications/vapid-key
// @access  Public
const getVapidKey = (req, res) => {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

module.exports = {
  subscribe,
  sendNotification,
  getVapidKey,
  sendPushToAll
};
