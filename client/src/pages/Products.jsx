import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');
  const category = searchParams.get('category');

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
        setLoading(true);
        let url = '/api/products?';
        if (keyword) url += `keyword=${keyword}&`;
        if (category) url += `category=${category}&`;
        
        const { data } = await axios.get(url);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category]);

  useEffect(() => {
    setSelectedCategory(category);
  }, [category]);

  const categoryCounts = (() => {
    const counts = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  })();

  const updateCategoryInUrl = (nextCategory) => {
    const params = new URLSearchParams(window.location.search);
    if (nextCategory) {
      params.set('category', nextCategory);
    } else {
      params.delete('category');
    }
    navigate(`/products?${params.toString()}`);
  };

  const availabilityFiltered = (() => {
    if (filterInStock && filterOutOfStock) return products;
    if (filterInStock) return products.filter(p => (p.stock ?? 0) > 0);
    if (filterOutOfStock) return products.filter(p => (p.stock ?? 0) <= 0);
    return products;
  })();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-serif">Products</h1>
        <div className="text-sm text-gray-500">
          <Link to="/" className="hover:text-indigo-600">Home</Link> <span className="mx-1">/</span> <span>Products</span>
        </div>
      </div>

      <div className="flex gap-10">
        <aside className="w-64 hidden lg:block">
          <div className="space-y-6">
            <div>
              <button className="w-full flex items-center justify-between text-sm uppercase tracking-widest text-gray-700">
                Categories <i className="fas fa-chevron-down opacity-60"></i>
              </button>
              <div className="mt-3 space-y-2">
                {(showAllCategories ? categoryCounts : categoryCounts.slice(0, 6)).map(([cat, count]) => (
                  <label key={cat} className="flex items-center justify-between text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat}
                        onChange={(e) => updateCategoryInUrl(e.target.checked ? cat : null)}
                      />
                      <span>{cat}</span>
                    </div>
                    <span className="text-gray-400">{count}</span>
                  </label>
                ))}
                {categoryCounts.length > 6 && (
                  <button
                    className="text-sm text-gray-600 mt-2 hover:text-gray-900"
                    onClick={() => setShowAllCategories(v => !v)}
                  >
                    {showAllCategories ? 'View less' : '+ View more'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <button className="w-full flex items-center justify-between text-sm uppercase tracking-widest text-gray-700">
                Availability <i className="fas fa-chevron-down opacity-60"></i>
              </button>
              <div className="mt-3 space-y-2">
                <label className="flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterInStock}
                      onChange={(e) => setFilterInStock(e.target.checked)}
                    />
                    <span>In stock</span>
                  </div>
                </label>
                <label className="flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterOutOfStock}
                      onChange={(e) => setFilterOutOfStock(e.target.checked)}
                    />
                    <span>Out of stock</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-end"></div>
          
      
      {availabilityFiltered.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-xl font-medium">No products found</p>
          {keyword && <p className="mt-2">We couldn't find any matches for "{keyword}"</p>}
          {category && <p className="mt-2">No products found in category "{category}"</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {availabilityFiltered.map((product) => (
            <div key={product._id} className="bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 relative group">
              <div className="relative">
                <Link to={`/products/${product._id}`}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-64 object-cover"
                  />
                </Link>
                {product.isTrendy && (
                  <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1">NEW</span>
                )}
                <button 
                  className={`absolute top-3 right-3 p-2 shadow-sm transition-all duration-200 ${
                    isInWishlist(product._id) 
                      ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                      : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-500'
                  }`}
                  onClick={(e) => handleToggleWishlist(e, product)}
                >
                  {isInWishlist(product._id) ? (
                    <i className="fas fa-heart text-xl"></i>
                  ) : (
                    <i className="far fa-heart text-xl"></i>
                  )}
                </button>
              </div>
              <div className="p-4">
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-indigo-600 truncate">{product.name}</h3>
                </Link>
                <p className="text-gray-600 mb-2 truncate">{product.description}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-sm mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="inline-flex">{i < 0 ? <i className="fas fa-star"></i> : <i className="far fa-star"></i>}</span>
                  ))}
                  <span className="ml-2 text-gray-500 text-xs">No reviews</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                  <Link 
                    to={`/products/${product._id}`}
                    className="bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-800"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </main>
      </div>
    </div>
  );
};

export default Products;