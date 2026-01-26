import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Get context functions to keep state in sync if needed, 
  // though we are fetching populated items here.
  const { isInWishlist, toggleWishlist } = useWishlist();

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

  const handleRemove = async (product) => {
    try {
        // Use context to remove if possible, as it updates the global count
        // If context toggleWishlist handles API calls, we can use it.
        // However, existing code used direct axios. 
        // Let's use the context method if it expects a product object, 
        // which will ensure the navbar count updates too.
        
        // We need to pass the product object to toggleWishlist
        await toggleWishlist(product);
        
        // Update local state
        setWishlistItems((prev) => prev.filter(item => item._id !== product._id));
    } catch (error) {
        console.error(error);
        // Fallback or error handling handled by context usually
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-normal text-center mb-12 font-serif">My Wishlist</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500 mb-6 font-light">Your wishlist is empty</p>
          <Link 
            to="/products" 
            className="inline-block bg-black text-white px-8 py-3 uppercase tracking-wider text-sm hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {wishlistItems.map((item) => (
            <div key={item._id} className="group">
              {/* Image Container */}
              <div className="relative aspect-square bg-gray-100 mb-4 rounded-lg overflow-hidden">
                <Link to={`/products/${item._id}`} className="block w-full h-full">
                    <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </Link>
                <button 
                  onClick={() => handleRemove(item)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors z-10"
                  aria-label="Remove from wishlist"
                >
                  <i className="fas fa-heart text-sm"></i>
                </button>
              </div>
              
              {/* Product Info */}
              <div className="flex justify-between items-start">
                <div className="space-y-1 pr-4">
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    <Link to={`/products/${item._id}`} className="hover:underline">
                        {item.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-gray-500">
                    From <span className="underline decoration-gray-300">Collection</span> in <span className="underline decoration-gray-300">{item.category}</span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 pt-1">
                    <i className="fas fa-star text-xs text-gray-400"></i> 
                    <span>4.5 by <span className="underline decoration-gray-300">Vendor</span></span>
                  </div>
                </div>
                <div className="text-base font-medium text-gray-900 shrink-0">
                  € {item.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
