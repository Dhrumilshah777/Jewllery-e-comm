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

  // We keep the component rendered but invisible to allow for transitions
  // If user is not logged in or other conditions not met, we can return null to avoid DOM pollution,
  // but since the useEffect controls 'show' based on those conditions, checking 'show' for visibility is enough.
  // However, to strictly follow the logic "if !user return", we should probably keep returning null if user is not there,
  // OR rely on 'show' never becoming true.
  // But wait, the previous code had `if (!show) return null`.
  // If I remove it, the component renders immediately (invisible).
  
  // To prevent rendering if checks fail (like !user), we can add a state 'shouldRender' or just rely on 'show' staying false.
  // But if 'show' is false, it's just invisible. That's fine.

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-all duration-500 ease-in-out ${
        show ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      <div 
        className={`bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center transform transition-all duration-500 ease-out ${
          show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
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
