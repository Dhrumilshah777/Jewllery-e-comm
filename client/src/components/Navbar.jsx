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
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Home</Link>
            <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Shop</Link>
            <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Wishlist</Link>
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Profile</Link>
                {user.isAdmin && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Admin Dashboard</Link>
                )}
                <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
