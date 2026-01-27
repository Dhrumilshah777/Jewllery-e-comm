import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Derived state for fast lookup
  const wishlistIds = useMemo(() => {
    return new Set(wishlistItems.map(item => item._id));
  }, [wishlistItems]);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.get('/api/users/profile');
      // Ensure we filter out nulls if any products were deleted
      const list = (data?.wishlist || []).filter(item => item !== null);
      setWishlistItems(list);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product) => {
    if (!user) {
      toast.info('Please login to manage wishlist');
      return false;
    }

    if (wishlistIds.has(product._id)) {
      toast.info('Product already in wishlist');
      return true;
    }

    // Optimistic update
    const previousItems = [...wishlistItems];
    setWishlistItems(prev => [...prev, product]);

    try {
      await axios.post('/api/users/wishlist', { productId: product._id }, { withCredentials: true });
      // toast.success('Added to wishlist');
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      const message = error.response?.data?.message || 'Error adding to wishlist';
      toast.error(message);
      // Revert
      setWishlistItems(previousItems);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) {
      toast.info('Please login to manage wishlist');
      return false;
    }

    // Optimistic update
    const previousItems = [...wishlistItems];
    setWishlistItems(prev => prev.filter(item => item._id !== productId));

    try {
      await axios.delete(`/api/users/wishlist/${productId}`, { withCredentials: true });
      // toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      const message = error.response?.data?.message || 'Error removing from wishlist';
      toast.error(message);
      // Revert
      setWishlistItems(previousItems);
      return false;
    }
  };

  const toggleWishlist = async (product) => {
    if (wishlistIds.has(product._id)) {
      return removeFromWishlist(product._id);
    } else {
      return addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
