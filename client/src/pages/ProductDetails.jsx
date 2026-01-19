import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setActiveImage(data.imageUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToWishlist = async () => {
    if (!user) {
      toast.info('Please login to add to wishlist');
      navigate('/login');
      return;
    }

  try {
      await axios.post(
        '/api/users/wishlist',
        { productId: product._id },
        { withCredentials: true }
      );
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding to wishlist');
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center mt-10">Product not found</div>;
  }

  return (
    <div className="bg-white shadow-lg overflow-hidden max-w-6xl mx-auto p-4">
      <div className="md:flex gap-8">
        <div className="md:w-1/2 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 md:h-[500px] no-scrollbar py-2 md:py-0">
            {[product.imageUrl, ...(product.subImages || [])].filter(img => img).map((img, index) => (
              <img 
                key={index}
                src={img}
                alt={`${product.name} ${index + 1}`}
                className={`w-20 h-20 md:w-full md:h-24 object-cover cursor-pointer border-2 transition-all duration-200 ${
                  activeImage === img ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
          <div className="flex-1 h-[400px] md:h-[500px]">
            <img 
              src={activeImage || product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold mb-2">
            {product.category}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center justify-between mb-8">
            <span className="text-3xl font-bold text-gray-900">${product.price}</span>
            <span className={`px-3 py-1 text-sm font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div className="flex space-x-4">
            <button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 transition duration-300"
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <button 
              onClick={addToWishlist}
              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 transition duration-300"
            >
              <i className="fas fa-heart mr-2"></i> Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
