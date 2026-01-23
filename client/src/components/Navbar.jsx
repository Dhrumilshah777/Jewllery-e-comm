import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <img
                className="h-20 w-auto transition-transform duration-300 hover:scale-105"
                src="/ao-logo.png"
                alt="AO Jewelry"
              />
              <span className="font-serif text-2xl tracking-widest text-gray-900 hidden sm:block">
                AO JEWELRY
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium uppercase tracking-wider transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium uppercase tracking-wider transition-colors">
              Shop
            </Link>
          </div>

          {/* Icons / User Menu */}
          <div className="hidden md:flex items-center space-x-6">
             {/* Search */}
             <button className="text-gray-500 hover:text-indigo-600 transition-colors">
               <i className="fas fa-search text-xl"></i>
             </button>
             
             {/* Wishlist */}
             <Link to="/wishlist" className="text-gray-500 hover:text-red-500 transition-colors">
               <i className="far fa-heart text-xl"></i>
             </Link>

             {/* Auth */}
             {user ? (
               <div className="relative group">
                 <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 focus:outline-none">
                   <span className="text-sm font-medium uppercase tracking-wide">{user.name.split(' ')[0]}</span>
                   <i className="fas fa-user-circle text-2xl"></i>
                 </button>
                 {/* Dropdown */}
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
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
               <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium uppercase text-sm tracking-wider">
                 Login
               </Link>
             )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden z-50 relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Mobile Menu Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
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
  );
};

export default Navbar;
