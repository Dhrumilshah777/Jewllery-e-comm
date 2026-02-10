import { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 border-t border-gray-100 animate-slide-up">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🍪</span>
            <h3 className="text-lg font-bold text-gray-900 font-serif">Cookie Preferences</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            We use cookies to ensure you get the best experience on our website. 
            These are primarily used for authentication to keep you logged in and secure. 
            By continuing to use this site, you agree to our use of cookies.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={handleReject}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 whitespace-nowrap"
          >
            Reject Non-Essential
          </button>
          <button 
            onClick={handleAccept}
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
