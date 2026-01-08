import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    
    if (!user) {
      toast.info('Please login to manage wishlist');
      navigate('/login');
      return;
    }

    const isInWishlist = wishlist.has(productId);

    // Optimistic update
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (isInWishlist) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });

    try {
      if (isInWishlist) {
        await axios.delete(`/api/users/wishlist/${productId}`, { withCredentials: true });
        toast.success('Removed from wishlist');
      } else {
        await axios.post('/api/users/wishlist', { productId }, { withCredentials: true });
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      const message = error.response?.data?.message || 'Error updating wishlist';
      toast.error(message);
      
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }

      // Revert on error
      setWishlist(prev => {
        const newWishlist = new Set(prev);
        if (isInWishlist) {
          newWishlist.add(productId);
        } else {
          newWishlist.delete(productId);
        }
        return newWishlist;
      });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (user) {
        try {
          const { data } = await axios.get('/api/users/profile', { withCredentials: true });
          const wishlistIds = new Set(data.wishlist.filter(item => item !== null).map(item => item._id));
          setWishlist(wishlistIds);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [user]);

  if (loading) {
    return <div className="text-center mt-10">Loading products...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-center">Our Collection</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group">
            <div className="relative">
              <Link to={`/products/${product._id}`}>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-64 object-cover"
                />
              </Link>
              <button 
                className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 ${
                  wishlist.has(product._id) 
                    ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                    : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500'
                }`}
                onClick={(e) => toggleWishlist(e, product._id)}
              >
                {wishlist.has(product._id) ? (
                  <FaHeart size={20} />
                ) : (
                  <FaRegHeart size={20} />
                )}
              </button>
            </div>
            <div className="p-4">
              <Link to={`/products/${product._id}`}>
                <h3 className="text-xl font-semibold mb-2 hover:text-indigo-600 truncate">{product.name}</h3>
              </Link>
              <p className="text-gray-600 mb-2 truncate">{product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                <Link 
                  to={`/products/${product._id}`}
                  className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
