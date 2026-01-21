import { useState, useEffect } from 'react';
import { subscribeUserToPush } from '../utils/pushNotifications';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const NotificationModal = () => {
  const [show, setShow] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only run if user is logged in
    if (!user) return;

    // Check if browser supports notifications
    if (!('Notification' in window)) return;

    // Check if permission is already granted or denied
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

    // Check if user already skipped in this session
    if (sessionStorage.getItem('notificationSkipped')) return;

    // Show after a short delay to be less intrusive
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleAllow = async () => {
    try {
      await subscribeUserToPush();
      toast.success('Notifications enabled!');
      setShow(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to enable notifications');
      setShow(false);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('notificationSkipped', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center transform transition-all scale-100">
        <div className="mb-4">
           {/* Bell Icon in a circle */}
           <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
             <i className="fas fa-bell text-indigo-600 text-xl"></i>
           </div>
           
           <h3 className="text-xl font-bold text-gray-900 mb-2">
             Turn on notifications
           </h3>
           
           <p className="text-gray-600 text-sm">
             Get the most out of LuxeGems by staying up to date with new arrivals, flash sales, and exclusive offers.
           </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAllow}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition duration-200"
          >
            Allow notifications
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition duration-200"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
