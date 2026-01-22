import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { subscribeUserToPush } from '../utils/pushNotifications';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktop =
        searchRef.current && searchRef.current.contains(event.target);
      const inMobile =
        mobileSearchRef.current && mobileSearchRef.current.contains(event.target);
      const inSearchButton = 
        searchButtonRef.current && searchButtonRef.current.contains(event.target);
        
      if (!inDesktop && !inMobile && !inSearchButton) {
        setShowSuggestions(false);
        setIsDesktopSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isDesktopSearchOpen && !isMobileSearchOpen) {
        setShowSuggestions(false);
        return;
      }

      if (searchQuery.trim().length > 0) {
        try {
          const { data } = await axios.get(`/api/products?keyword=${searchQuery}`);
          setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        try {
          const { data } = await axios.get('/api/products?isTrendy=true');
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching default suggestions:', error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isDesktopSearchOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    if (isDesktopSearchOpen && desktopSearchInputRef.current) {
      desktopSearchInputRef.current.focus();
    }
  }, [isDesktopSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${searchQuery}`);
      setShowSuggestions(false);
      setIsDesktopSearchOpen(false);
      if (window.innerWidth < 1025) {
        setIsMobileSearchOpen(false);
      }
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/products/${productId}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsDesktopSearchOpen(false);
    if (window.innerWidth < 1025) {
      setIsMobileSearchOpen(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleSubscribe = async () => {
    try {
      await subscribeUserToPush();
      toast.success('Notifications enabled!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to enable notifications');
    }
  };

  return (
    <nav className="bg-white shadow-md relative z-40">
      {isMobileSearchOpen && (
        <div className="fixed inset-x-0 top-0 z-50 min-[1025px]:hidden bg-white shadow-md animate-slide-down">
          <div ref={mobileSearchRef} className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setShowSuggestions(false);
                }}
                className="text-gray-600"
                aria-label="Close search"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
              <span className="text-sm font-medium text-gray-700">Search</span>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200 text-sm"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <button type="submit" className="hidden">Search</button>
            </form>
            {showSuggestions && (
              <div className="mt-2 bg-white rounded-none shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                  {searchQuery ? 'Suggestions' : 'Trending Now'}
                </h3>
                {suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((product) => (
                      <li
                        key={product._id}
                        onClick={() => handleSuggestionClick(product._id)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b last:border-b-0 border-gray-100 transition duration-150"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-none mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">${product.price}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No product found</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Mobile Top Bar */}
      <div className="min-[1025px]:hidden px-4 py-3 flex items-center justify-between relative">
        <button 
          className="text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <i className="fas fa-times text-2xl"></i> : <i className="fas fa-bars text-2xl"></i>}
        </button>
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-indigo-600">
          LuxeGems
        </Link>
        <div className="w-6" />
      </div>

      {/* Desktop Header */}
      <div className="hidden min-[1025px]:flex container mx-auto px-4 py-4 items-center justify-between relative">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-wide">
            LuxeGems
          </Link>
        </div>

        {/* Center: Navigation Links (Always Visible) */}
        <div className="flex-1 flex justify-center px-8">
           <div className="flex items-center space-x-8">
             <Link to="/products" className="text-gray-800 font-medium hover:text-indigo-600 tracking-wide uppercase text-sm">
               Collection
             </Link>
             <Link to="/about" className="text-gray-800 font-medium hover:text-indigo-600 tracking-wide uppercase text-sm">
               About
             </Link>
           </div>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center space-x-6 flex-shrink-0">
           <button 
             ref={searchButtonRef}
             onClick={() => setIsDesktopSearchOpen(!isDesktopSearchOpen)}
             className="text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none"
           >
             {isDesktopSearchOpen ? <i className="fas fa-times text-xl"></i> : <i className="fas fa-search text-xl"></i>}
           </button>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-indigo-600 font-medium text-sm uppercase tracking-wide">
                  Dashboard
                </Link>
              )}
              <Link to="/wishlist" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <i className="fas fa-heart text-xl"></i>
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <i className="fas fa-user text-xl"></i>
              </Link>
            </>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
              <i className="fas fa-user text-xl"></i>
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Search Drawer */}
      <div 
        ref={searchRef}
        className={`hidden min-[1025px]:block absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl z-50 overflow-hidden transition-all duration-300 ease-in-out ${isDesktopSearchOpen ? 'max-h-[400px] opacity-100 py-12' : 'max-h-0 opacity-0 py-0'}`}
      >
        <div className="container mx-auto px-4 relative">
          <button
            onClick={() => setIsDesktopSearchOpen(false)}
            className="absolute right-4 top-0 text-gray-400 hover:text-gray-600"
          >
             <i className="fas fa-times text-2xl"></i>
          </button>
          
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative mt-8">
             <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
             <input
               ref={desktopSearchInputRef}
               type="text"
               placeholder="Search product"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-12 pr-4 py-3 text-lg border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors bg-white placeholder-gray-400"
             />
          </form>

          {/* Suggestions in Drawer */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="max-w-3xl mx-auto mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {searchQuery ? 'Suggestions' : 'Trending Now'}
              </h3>
              <ul className="grid grid-cols-1 gap-2">
                {suggestions.map((product) => (
                  <li
                    key={product._id}
                    onClick={() => handleSuggestionClick(product._id)}
                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md mr-4 group-hover:opacity-80 transition-opacity"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-sm text-gray-500">${product.price}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showSuggestions && suggestions.length === 0 && searchQuery.trim().length > 0 && (
             <div className="text-center mt-6 text-gray-500">No products found</div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`min-[1025px]:hidden bg-white shadow-lg absolute w-full z-50 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100 border-t border-gray-100 py-4' : 'max-h-0 opacity-0 border-none py-0'}`}>
        <div className="px-4 flex flex-col space-y-4">
          <Link 
            to="/products" 
            className="text-gray-600 hover:text-indigo-600 font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Collection
          </Link>
          <Link 
            to="/about" 
            className="text-gray-600 hover:text-indigo-600 font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          
          <button
            onClick={() => {
              handleSubscribe();
              setIsMenuOpen(false);
            }}
            className="text-gray-600 hover:text-indigo-600 font-medium flex items-center text-left"
          >
            <i className="fas fa-bell mr-2"></i> Notifications
          </button>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-gray-600 hover:text-indigo-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link 
                to="/profile" 
                className="text-gray-600 hover:text-indigo-600 font-medium flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-user-circle mr-2"></i> Profile
              </Link>
              <Link 
                to="/wishlist" 
                className="text-gray-600 hover:text-indigo-600 font-medium flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-heart mr-2"></i> Wishlist
              </Link>
              <button
                onClick={() => {
                  handleLogoutClick();
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-indigo-600 font-medium flex items-center text-left"
              >
                <i className="fas fa-user mr-2"></i> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-indigo-600 font-medium flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="fas fa-user mr-2"></i> Login
            </Link>
          )}
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 w-96 shadow-2xl border border-gray-200 animate-popup">
            <h3 className="text-xl font-bold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm min-[1025px]:hidden z-40">
        <div className="grid grid-cols-4 text-xs">
          <Link to="/" className="flex flex-col items-center py-3 text-gray-700 hover:text-indigo-600">
            <i className="fas fa-home text-lg"></i>
            <span className="mt-1">Home</span>
          </Link>
          <button
            onClick={() => {
              setIsMobileSearchOpen(true);
              setShowSuggestions(false);
            }}
            className="flex flex-col items-center py-3 text-gray-700 hover:text-indigo-600"
          >
            <i className="fas fa-search"></i>
            <span className="mt-1">Search</span>
          </button>
          <Link to="/wishlist" className="flex flex-col items-center py-3 text-gray-700 hover:text-indigo-600">
            <i className="fas fa-heart"></i>
            <span className="mt-1">Wishlist</span>
          </Link>
          <Link to={user ? '/profile' : '/login'} className="flex flex-col items-center py-3 text-gray-700 hover:text-indigo-600">
            <i className="fas fa-user"></i>
            <span className="mt-1">Account</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;