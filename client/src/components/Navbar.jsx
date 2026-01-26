import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingSuggestedProducts, setLoadingSuggestedProducts] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [showSearch]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const { data } = await axios.get(`/api/products?keyword=${searchQuery}&limit=5`);
        setSuggestions(data.products || data); // Adjust based on API response structure
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      if (suggestedProducts.length > 0) return;
      setLoadingSuggestedProducts(true);
      try {
        const { data } = await axios.get('/api/products?limit=4');
        setSuggestedProducts(data.products || data);
      } catch (error) {
        console.error('Error fetching suggested products:', error);
      } finally {
        setLoadingSuggestedProducts(false);
      }
    };

    if (showSearch) {
      fetchSuggestedProducts();
    }
  }, [showSearch]);

  // Prevent body scroll when search is open
  useEffect(() => {
    if (showSearch || isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSearch, isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  return (
    <>
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Full Screen Search Overlay */}
      <div className={`fixed inset-0 bg-white z-[60] transform transition-transform duration-500 ease-in-out ${showSearch ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className={`relative h-full flex flex-col pt-24 px-4 transition-opacity duration-500 overflow-y-auto ${showSearch ? 'opacity-100 delay-100' : 'opacity-0'}`}>
          <button 
            onClick={() => setShowSearch(false)}
            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <i className="fa-light fa-xmark text-2xl"></i>
          </button>
          
          <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full text-2xl md:text-4xl border-b-2 border-gray-200 py-4 px-2 focus:outline-none focus:border-indigo-600 bg-transparent placeholder-gray-300"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <i className="fa-light fa-magnifying-glass text-2xl md:text-3xl"></i>
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-100 max-h-[60vh] overflow-y-auto">
                {loadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((product) => (
                      <li key={product._id}>
                        <button
                          onClick={() => {
                            navigate(`/products/${product._id}`);
                            setShowSearch(false);
                            setSearchQuery('');
                            setSuggestions([]);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-4 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">${product.price}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500">No products found</div>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="mt-8">
                <div className="text-center text-gray-500 mb-10">
                  <p className="text-sm uppercase tracking-wider mb-4">Popular Searches</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {['Rings', 'Necklaces', 'Earrings', 'Bracelets'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          navigate(`/products?keyword=${term}`);
                          setShowSearch(false);
                        }}
                        className="px-4 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <p className="text-sm uppercase tracking-wider mb-6 text-center text-gray-500">Suggested For You</p>
                  {loadingSuggestedProducts ? (
                    <div className="text-center text-gray-500">Loading suggestions...</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {suggestedProducts.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => {
                            navigate(`/products/${product._id}`);
                            setShowSearch(false);
                          }}
                          className="group text-left"
                        >
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <h3 className="text-sm text-gray-900 font-medium truncate">{product.name}</h3>
                          <p className="text-sm text-gray-500">${product.price}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center md:justify-between h-16 items-center relative">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img
                className="h-24 w-auto transition-transform duration-300 hover:scale-105"
                src="/ao-logo.png"
                alt="AO Jewelry"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="group flex items-center gap-1 text-gray-900 hover:text-gray-600 px-1 py-2 text-sm font-normal uppercase tracking-wider transition-colors border-b-2 border-gray-900">
              Home
            </Link>
            <Link to="/products" className="group flex items-center gap-1 text-gray-900 hover:text-gray-600 px-1 py-2 text-sm font-normal uppercase tracking-wider transition-colors border-b-2 border-transparent hover:border-gray-900">
              Shop
            </Link>
            <Link to="/products" className="group flex items-center gap-1 text-gray-900 hover:text-gray-600 px-1 py-2 text-sm font-normal uppercase tracking-wider transition-colors border-b-2 border-transparent hover:border-gray-900">
              Product
            </Link>
            <Link to="#" className="group flex items-center gap-1 text-gray-900 hover:text-gray-600 px-1 py-2 text-sm font-normal uppercase tracking-wider transition-colors border-b-2 border-transparent hover:border-gray-900">
              Blog
            </Link>
            <Link to="#" className="group flex items-center gap-1 text-gray-900 hover:text-gray-600 px-1 py-2 text-sm font-normal uppercase tracking-wider transition-colors border-b-2 border-transparent hover:border-gray-900">
              Featured
            </Link>
          </div>

          {/* Icons / User Menu */}
          <div className="hidden md:flex items-center space-x-6">
             {/* Search */}
             <button 
               onClick={() => setShowSearch(true)}
               className="text-gray-900 hover:text-gray-600 transition-colors cursor-pointer"
             >
               <i className="fa-light fa-magnifying-glass text-xl"></i>
             </button>
             
             {/* Auth */}
             {user ? (
               <div className="relative group">
                 <button className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 focus:outline-none">
                   <i className="fa-light fa-user text-xl"></i>
                 </button>
                 {/* Dropdown */}
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                   <div className="px-4 py-2 border-b border-gray-100">
                     <p className="text-sm font-medium text-gray-900">{user.name}</p>
                     <p className="text-xs text-gray-500">{user.email}</p>
                   </div>
                   <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                   {user.isAdmin && (
                     <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                   )}
                   <button 
                     onClick={logout}
                     className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                   >
                     Logout
                   </button>
                 </div>
               </div>
             ) : (
               <Link to="/login" className="text-gray-900 hover:text-gray-600 transition-colors">
                 <i className="fa-light fa-user text-xl"></i>
               </Link>
             )}

             {/* Wishlist */}
             <Link to="/wishlist" className="relative text-gray-900 hover:text-gray-600 transition-colors">
               <i className="fa-light fa-heart text-xl"></i>
               <span className="absolute -top-1 -right-2 bg-black text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                 {wishlistCount}
               </span>
             </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden z-[60] absolute left-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <i className={`${isOpen ? 'fa-light fa-xmark' : 'fa-light fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-transparent backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Mobile Menu Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-6 pb-6 overflow-y-auto">
          <div className="space-y-6">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-800 hover:text-indigo-600 border-b border-gray-100 pb-2"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-800 hover:text-indigo-600 border-b border-gray-100 pb-2"
            >
              Shop
            </Link>
            <Link 
              to="/wishlist" 
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium text-gray-800 hover:text-indigo-600 border-b border-gray-100 pb-2"
            >
              Wishlist
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-gray-800 hover:text-indigo-600 border-b border-gray-100 pb-2"
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-gray-800 hover:text-indigo-600 border-b border-gray-100 pb-2"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-lg font-medium text-red-600 hover:text-red-700 pt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="block text-lg font-medium text-gray-800 hover:text-indigo-600 pt-2"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
    
      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 md:hidden">
        <div className="grid h-full grid-cols-4 mx-auto font-medium">
          <Link to="/" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group text-gray-500 hover:text-indigo-600">
            <i className="fa-light fa-house text-xl mb-1 group-hover:text-indigo-600"></i>
            <span className="text-[10px] uppercase tracking-wider group-hover:text-indigo-600">Home</span>
          </Link>
          <button 
            onClick={() => setShowSearch(true)}
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group text-gray-500 hover:text-indigo-600 cursor-pointer"
          >
            <i className="fa-light fa-magnifying-glass text-xl mb-1 group-hover:text-indigo-600"></i>
            <span className="text-[10px] uppercase tracking-wider group-hover:text-indigo-600">Search</span>
          </button>
          <Link to="/wishlist" className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group text-gray-500 hover:text-indigo-600 relative">
            <div className="relative">
              <i className="fa-light fa-heart text-xl mb-1 group-hover:text-indigo-600"></i>
              {wishlistCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </div>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider group-hover:text-indigo-600">Wishlist</span>
          </Link>
          <Link to={user ? "/profile" : "/login"} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group text-gray-500 hover:text-indigo-600">
            <i className="fa-light fa-user text-xl mb-1 group-hover:text-indigo-600"></i>
            <span className="text-[10px] uppercase tracking-wider group-hover:text-indigo-600">Account</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
