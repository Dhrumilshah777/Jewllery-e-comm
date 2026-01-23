import { useEffect, useState } from 'react';
import { subscribeUserToPush } from '../utils/pushNotifications';

const NotificationModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if permission is default (not granted or denied)
    // and if the browser supports notifications
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async () => {
    try {
      await subscribeUserToPush();
      setShowModal(false);
    } catch (error) {
      console.error('Subscription failed', error);
      // Optionally handle error (e.g. user denied)
      setShowModal(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full border border-gray-100 transform transition-all animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 mb-4">
            <i className="fas fa-bell text-indigo-600 text-xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Enable Notifications</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Stay updated with our latest collections, flash sales, and exclusive offers!
          </p>
          <div className="flex space-x-3 justify-center">
             <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubscribe}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Allow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
