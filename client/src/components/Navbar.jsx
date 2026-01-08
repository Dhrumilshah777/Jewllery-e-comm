import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaHeart, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          LuxeGems
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/products" className="text-gray-600 hover:text-indigo-600">
            Collection
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-indigo-600">
            About
          </Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-indigo-600">
                  Dashboard
                </Link>
              )}
              <Link to="/wishlist" className="text-gray-600 hover:text-indigo-600">
                <FaHeart className="text-xl" />
              </Link>
              <button onClick={handleLogoutClick} className="text-gray-600 hover:text-indigo-600">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
              <FaUser />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl border border-gray-200 animate-popup">
            <h3 className="text-xl font-bold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
