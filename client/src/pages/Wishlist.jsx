import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get('/api/users/profile', {
          withCredentials: true
        });
        setWishlistItems(data.wishlist || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/users/wishlist/${productId}`, {
        withCredentials: true
      });
      toast.success('Removed from wishlist');
      setWishlistItems((prev) => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error(error);
      toast.error('Error removing from wishlist');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-10 bg-white shadow">
          <p className="text-xl text-gray-600 mb-4">Your wishlist is empty</p>
          <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {wishlistItems.map((item) => (
            <div key={item._id} className="bg-white shadow p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover"
                />
                <div>
                  <Link to={`/products/${item._id}`} className="text-xl font-semibold hover:text-indigo-600">
                    {item.name}
                  </Link>
                  <p className="text-gray-600">${item.price}</p>
                </div>
              </div>
              
              <button 
                onClick={() => removeFromWishlist(item._id)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 transition"
                aria-label="Remove from wishlist"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
