import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('manage');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    imageUrl: '',
    stock: '',
    isTrendy: false,
    isLatestBeauty: false,
    isNewest: false,
    subImages: ['']
  });
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    subtitle: '',
    image: ''
  });
  const [popularCategoryFormData, setPopularCategoryFormData] = useState({
    name: '',
    image: ''
  });
  const [homeBannerForm, setHomeBannerForm] = useState({
    leftImage: '',
    leftTitle: '',
    leftSubtitle: '',
    leftLink: '/products?category=Rings',
    rightImage: '',
    rightTitle: '',
    rightSubtitle: '',
    rightLink: '/products?category=Bracelets',
  });

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    url: '',
    icon: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'latest', 'newest', 'trendy'
  
  // Gallery State
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryFormData, setGalleryFormData] = useState({
    title: '',
    imageUrl: '',
    category: 'General'
  });
  const [galleryFilter, setGalleryFilter] = useState('All');

  const categories = [
    'Rings',
    'Necklaces',
    'Earrings',
    'Bracelets',
    'Charm & Dangles',
    'Gift Ideas'
  ];

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`/api/products?t=${new Date().getTime()}`);
      setProducts(data);
    } catch (error) {
      toast.error('Error fetching products');
    }
  };

  const fetchSlides = async () => {
    try {
      const { data } = await axios.get('/api/slides');
      setSlides(data);
    } catch (error) {
      console.error('Error fetching slides');
    }
  };

  const fetchPopularCategories = async () => {
    try {
      const { data } = await axios.get('/api/popular-categories');
      setPopularCategories(data);
    } catch (error) {
      console.error('Error fetching popular categories');
    }
  };
  const fetchHomeBanner = async () => {
    try {
      const { data } = await axios.get('/api/home-banner');
      if (data) {
        setHomeBannerForm({
          leftImage: data.leftImage,
          leftTitle: data.leftTitle,
          leftSubtitle: data.leftSubtitle,
          leftLink: data.leftLink,
          rightImage: data.rightImage,
          rightTitle: data.rightTitle,
          rightSubtitle: data.rightSubtitle,
          rightLink: data.rightLink,
        });
      }
    } catch (error) {
      console.error('Error fetching home banner');
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const { data } = await axios.get('/api/gallery');
      setGalleryItems(data);
    } catch (error) {
      console.error('Error fetching gallery items');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSlides();
    fetchPopularCategories();
    fetchHomeBanner();
    fetchGalleryItems();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/products', 
        formData, 
        { withCredentials: true }
      );
      toast.success('Product created successfully');
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        imageUrl: '',
        stock: '',
        isTrendy: false,
        isLatestBeauty: false,
        isNewest: false,
        subImages: ['']
      });
      await fetchProducts();
      queryClient.invalidateQueries({ queryKey: ['latestProducts'] });
      queryClient.invalidateQueries({ queryKey: ['newestProducts'] });
      setActiveTab('manage');
    } catch (error) {
      toast.error('Error creating product');
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await axios.delete(`/api/products/${deleteConfirmation}`, { withCredentials: true });
      toast.success('Product deleted successfully');
      await fetchProducts();
      queryClient.invalidateQueries({ queryKey: ['latestProducts'] });
      queryClient.invalidateQueries({ queryKey: ['newestProducts'] });
      setDeleteConfirmation(null);
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleSlideChange = (e) => {
    setSlideFormData({ ...slideFormData, [e.target.name]: e.target.value });
  };

  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/slides', 
        slideFormData, 
        { withCredentials: true }
      );
      toast.success('Slide created successfully');
      setSlideFormData({
        title: '',
        subtitle: '',
        image: ''
      });
      fetchSlides();
      queryClient.invalidateQueries({ queryKey: ['slides'] });
    } catch (error) {
      toast.error('Error creating slide');
    }
  };

  const handleSlideDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      try {
        await axios.delete(`/api/slides/${id}`, { withCredentials: true });
        toast.success('Slide deleted successfully');
        fetchSlides();
        queryClient.invalidateQueries({ queryKey: ['slides'] });
      } catch (error) {
        toast.error('Error deleting slide');
      }
    }
  };

  const handleEditSlideClick = (slide) => {
    setEditingSlide(slide);
  };

  const handleUpdateSlide = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/slides/${editingSlide._id}`,
        editingSlide,
        { withCredentials: true }
      );
      toast.success('Slide updated successfully');
      setEditingSlide(null);
      fetchSlides();
      queryClient.invalidateQueries({ queryKey: ['slides'] });
    } catch (error) {
      toast.error('Error updating slide');
    }
  };

  const handlePopularCategoryChange = (e) => {
    setPopularCategoryFormData({ ...popularCategoryFormData, [e.target.name]: e.target.value });
  };

  const handlePopularCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/popular-categories', 
        { ...popularCategoryFormData, name: popularCategoryFormData.name.trim() }, 
        { withCredentials: true }
      );
      toast.success('Category created successfully');
      setPopularCategoryFormData({
        name: '',
        image: ''
      });
      fetchPopularCategories();
      queryClient.invalidateQueries({ queryKey: ['popularCategories'] });
    } catch (error) {
      toast.error('Error creating category');
    }
  };

  const handlePopularCategoryDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/popular-categories/${id}`, { withCredentials: true });
        toast.success('Category deleted successfully');
        fetchPopularCategories();
        queryClient.invalidateQueries({ queryKey: ['popularCategories'] });
      } catch (error) {
        toast.error('Error deleting category');
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct({
      ...product,
      subImages: product.subImages && product.subImages.length > 0 ? product.subImages : ['']
    });
  };

  const handleSubImageChange = (index, value, isEditing = false) => {
    if (isEditing) {
      const newSubImages = [...editingProduct.subImages];
      newSubImages[index] = value;
      setEditingProduct({ ...editingProduct, subImages: newSubImages });
    } else {
      const newSubImages = [...formData.subImages];
      newSubImages[index] = value;
      setFormData({ ...formData, subImages: newSubImages });
    }
  };

  const addSubImageField = (isEditing = false) => {
    if (isEditing) {
      setEditingProduct({ ...editingProduct, subImages: [...editingProduct.subImages, ''] });
    } else {
      setFormData({ ...formData, subImages: [...formData.subImages, ''] });
    }
  };

  const removeSubImageField = (index, isEditing = false) => {
    if (isEditing) {
      const newSubImages = editingProduct.subImages.filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, subImages: newSubImages });
    } else {
      const newSubImages = formData.subImages.filter((_, i) => i !== index);
      setFormData({ ...formData, subImages: newSubImages });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/products/${editingProduct._id}`,
        editingProduct,
        { withCredentials: true }
      );
      toast.success('Product updated successfully');
      setEditingProduct(null);
      await fetchProducts();
      queryClient.invalidateQueries({ queryKey: ['latestProducts'] });
      queryClient.invalidateQueries({ queryKey: ['newestProducts'] });
    } catch (error) {
      toast.error('Error updating product');
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/notifications/send',
        notificationForm,
        { withCredentials: true }
      );
      toast.success('Notification sent successfully!');
      setNotificationForm({
        title: '',
        message: '',
        url: '',
        icon: ''
      });
    } catch (error) {
      toast.error('Error sending notification');
      console.error(error);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/gallery',
        galleryFormData,
        { withCredentials: true }
      );
      toast.success('Image added to gallery');
      setGalleryFormData({
        title: '',
        imageUrl: '',
        category: 'General'
      });
      fetchGalleryItems();
    } catch (error) {
      toast.error('Error adding image to gallery');
    }
  };

  const handleGalleryDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await axios.delete(`/api/gallery/${id}`, { withCredentials: true });
        toast.success('Image deleted from gallery');
        fetchGalleryItems();
      } catch (error) {
        toast.error('Error deleting image');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
          }
          .animate-scale-in {
            animation: scaleIn 0.3s ease-out forwards;
          }
        `}
      </style>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'manage'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'add'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Add New Product
        </button>
        <button
          onClick={() => setActiveTab('slides')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'slides'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Manage Slides
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Popular Categories
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'banner'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Home Banner
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'collections'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-6 py-2 font-medium transition duration-200 ${
            activeTab === 'gallery'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Gallery
        </button>
      </div>
      
      {activeTab === 'notifications' && (
        <div className="bg-white shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Send Push Notification</h2>
          <form onSubmit={handleNotificationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Notification Title
              </label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. Flash Sale Alert!"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Message Body
              </label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. Get 50% off on all rings this weekend."
                rows="3"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Target URL (Optional)
              </label>
              <input
                type="text"
                value={notificationForm.url}
                onChange={(e) => setNotificationForm({ ...notificationForm, url: e.target.value })}
                className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. /products?category=Rings"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Icon URL (Optional)
              </label>
              <input
                type="text"
                value={notificationForm.icon}
                onChange={(e) => setNotificationForm({ ...notificationForm, icon: e.target.value })}
                className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Default: /ao-logo.png"
              />
            </div>
            
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
              >
                <i className="fas fa-paper-plane mr-2"></i> Send Notification
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'collections' && (
      <div className="bg-white shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Manage Collections</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Sr.no</th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Collections</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products
                .filter(p => (p.isLatestBeauty === true || p.isLatestBeauty === 'true') || (p.isNewest === true || p.isNewest === 'true'))
                .map((product, index) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 object-cover mr-3"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">${product.price}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {(product.isLatestBeauty === true || product.isLatestBeauty === 'true') && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full inline-block text-center">
                          Latest Beauty
                        </span>
                      )}
                      {(product.isNewest === true || product.isNewest === 'true') && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block text-center">
                          Newest Collection
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.filter(p => (p.isLatestBeauty === true || p.isLatestBeauty === 'true') || (p.isNewest === true || p.isNewest === 'true')).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No products found in these collections.</p>
              <p className="text-sm text-gray-400">Go to "Manage Products" or "Add New Product" to add items to Latest Beauty or Newest Collection.</p>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-8">
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Add New Gallery Image</h2>
            <form onSubmit={handleGallerySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={galleryFormData.title}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Image Title"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={galleryFormData.imageUrl}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, imageUrl: e.target.value })}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={galleryFormData.category}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, category: e.target.value })}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="General"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center"
                >
                  <i className="fa-light fa-plus mr-2"></i> Add to Gallery
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Manage Gallery</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter by Category:</span>
                <select
                  value={galleryFilter}
                  onChange={(e) => setGalleryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All</option>
                  {[...new Set(galleryItems.map(item => item.category))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {galleryItems
                .filter(item => galleryFilter === 'All' || item.category === galleryFilter)
                .map((item) => (
                <div key={item._id} className="relative group bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-w-1 aspect-h-1">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                    <button
                      onClick={() => handleGalleryDelete(item._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {galleryItems.filter(item => galleryFilter === 'All' || item.category === galleryFilter).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No images found in the gallery.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-8">
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Add New Popular Category</h2>
            <form onSubmit={handlePopularCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={popularCategoryFormData.name}
                  onChange={handlePopularCategoryChange}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={popularCategoryFormData.image}
                  onChange={handlePopularCategoryChange}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline w-full"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Current Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularCategories.map((category) => (
                <div key={category._id} className="flex flex-col items-center relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-2 border border-gray-100 shadow-sm">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800">{category.name}</span>
                  <button
                    onClick={() => handlePopularCategoryDelete(category._id)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'slides' && (
        <div className="space-y-8">
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Add New Slide</h2>
            <form onSubmit={handleSlideSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={slideFormData.image}
                  onChange={handleSlideChange}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={slideFormData.title}
                  onChange={handleSlideChange}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={slideFormData.subtitle}
                  onChange={handleSlideChange}
                  className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline w-full"
                >
                  Add Slide
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Current Slides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slides.map((slide) => (
                <div key={slide._id} className="border overflow-hidden shadow-sm relative group">
                  <img src={slide.image} alt={slide.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{slide.title}</h3>
                    <p className="text-gray-600">{slide.subtitle}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditSlideClick(slide)}
                      className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleSlideDelete(slide._id)}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Edit Slide Modal */}
          {editingSlide && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white shadow-xl max-w-lg w-full p-6 animate-scale-in">
                <h2 className="text-2xl font-bold mb-6">Edit Slide</h2>
                <form onSubmit={handleUpdateSlide} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={editingSlide.image}
                      onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                      className="w-full border p-2 rounded focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingSlide.title}
                      onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                      className="w-full border p-2 rounded focus:outline-none focus:border-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={editingSlide.subtitle}
                      onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                      className="w-full border p-2 rounded focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded transition duration-300"
                    >
                      Update Slide
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSlide(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'banner' && (
        <div className="space-y-8">
          <div className="bg-white shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Edit Home Banner</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await axios.put('/api/home-banner', homeBannerForm, { withCredentials: true });
                  toast.success('Home banner updated');
                  queryClient.invalidateQueries({ queryKey: ['homeBanner'] });
                } catch (error) {
                  toast.error('Error updating banner');
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div>
                <h3 className="font-semibold mb-4">Left Panel</h3>
                <label className="block text-gray-700 text-sm mb-2">Image URL</label>
                <input
                  type="text"
                  value={homeBannerForm.leftImage}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, leftImage: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
                <label className="block text-gray-700 text-sm mb-2 mt-4">Title</label>
                <input
                  type="text"
                  value={homeBannerForm.leftTitle}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, leftTitle: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
                <label className="block text-gray-700 text-sm mb-2 mt-4">Subtitle</label>
                <input
                  type="text"
                  value={homeBannerForm.leftSubtitle}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, leftSubtitle: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
                <label className="block text-gray-700 text-sm mb-2 mt-4">Link</label>
                <input
                  type="text"
                  value={homeBannerForm.leftLink}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, leftLink: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <h3 className="font-semibold mb-4">Right Panel</h3>
                <label className="block text-gray-700 text-sm mb-2">Image URL</label>
                <input
                  type="text"
                  value={homeBannerForm.rightImage}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, rightImage: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
                <label className="block text-gray-700 text-sm mb-2 mt-4">Title</label>
                <input
                  type="text"
                  value={homeBannerForm.rightTitle}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, rightTitle: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
                <label className="block text-gray-700 text-sm mb-2 mt-4">Subtitle</label>
                <input
                  type="text"
                  value={homeBannerForm.rightSubtitle}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, rightSubtitle: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
                <label className="block text-gray-700 text-sm mb-2 mt-4">Link</label>
                <input
                  type="text"
                  value={homeBannerForm.rightLink}
                  onChange={(e) => setHomeBannerForm({ ...homeBannerForm, rightLink: e.target.value })}
                  className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline w-full"
                >
                  Save Banner
                </button>
              </div>
            </form>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-48 overflow-hidden border">
                {homeBannerForm.leftImage && (
                  <img src={homeBannerForm.leftImage} alt="Left preview" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute bottom-4 left-4">
                  <div className="font-semibold">{homeBannerForm.leftTitle}</div>
                  <div className="text-sm text-gray-700">{homeBannerForm.leftSubtitle}</div>
                </div>
              </div>
              <div className="relative h-48 overflow-hidden border">
                {homeBannerForm.rightImage && (
                  <img src={homeBannerForm.rightImage} alt="Right preview" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute bottom-4 right-4 text-right">
                  <div className="font-semibold">{homeBannerForm.rightTitle}</div>
                  <div className="text-sm text-gray-700">{homeBannerForm.rightSubtitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {activeTab === 'add' && (
        <div className="bg-white shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              rows="4"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
          
          <div className="md:col-span-2 flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isTrendy"
                checked={formData.isTrendy}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-gray-700">Trendy Collection</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isLatestBeauty"
                checked={formData.isLatestBeauty}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-gray-700">Latest Beauty</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isNewest"
                checked={formData.isNewest}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-gray-700">Newest Collection</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Sub Images</label>
            {formData.subImages.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleSubImageChange(index, e.target.value)}
                  className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  placeholder="Sub Image URL"
                />
                <button
                  type="button"
                  onClick={() => removeSubImageField(index)}
                  className="bg-red-500 text-white px-3 py-2 hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSubImageField()}
              className="mt-2 bg-gray-500 text-white px-4 py-2 hover:bg-gray-600"
            >
              Add Sub Image
            </button>
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 transition duration-300"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
      )}

      {activeTab === 'manage' && (
      <div className="bg-white shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Manage Products</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filterType === 'all'
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setFilterType('latest')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filterType === 'latest'
                  ? 'bg-purple-100 text-purple-800 border-purple-200 ring-2 ring-purple-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-purple-50'
              }`}
            >
              Latest Beauty
            </button>
            <button
              onClick={() => setFilterType('newest')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filterType === 'newest'
                  ? 'bg-blue-100 text-blue-800 border-blue-200 ring-2 ring-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50'
              }`}
            >
              Newest Collection
            </button>
            <button
              onClick={() => setFilterType('trendy')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filterType === 'trendy'
                  ? 'bg-pink-100 text-pink-800 border-pink-200 ring-2 ring-pink-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-pink-50'
              }`}
            >
              Trendy
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Sr.no</th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Tags</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products
                .filter(p => {
                  if (filterType === 'all') return true;
                  if (filterType === 'latest') return p.isLatestBeauty === true || p.isLatestBeauty === 'true';
                  if (filterType === 'newest') return p.isNewest === true || p.isNewest === 'true';
                  if (filterType === 'trendy') return p.isTrendy === true || p.isTrendy === 'true';
                  return true;
                })
                .map((product, index) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 object-cover mr-3"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">${product.price}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {(product.isTrendy === true || product.isTrendy === 'true') && (
                        <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full inline-block text-center">
                          Trendy
                        </span>
                      )}
                      {(product.isLatestBeauty === true || product.isLatestBeauty === 'true') && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full inline-block text-center">
                          Latest
                        </span>
                      )}
                      {(product.isNewest === true || product.isNewest === 'true') && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-block text-center">
                          Newest
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 transition duration-300 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No products found.</p>
          )}
        </div>
      </div>
      )}
      
      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh] animate-scale-in">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2 flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isTrendy || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isTrendy: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-gray-700">Trendy Collection</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isLatestBeauty || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isLatestBeauty: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-gray-700">Latest Beauty</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNewest || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isNewest: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-gray-700">Newest Collection</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Sub Images</label>
                {editingProduct.subImages && editingProduct.subImages.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleSubImageChange(index, e.target.value, true)}
                      className="w-full border px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      placeholder="Sub Image URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubImageField(index, true)}
                      className="bg-red-500 text-white px-3 py-2 hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSubImageField(true)}
                  className="mt-2 bg-gray-500 text-white px-4 py-2 hover:bg-gray-600"
                >
                  Add Sub Image
                </button>
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 transition duration-300 transform hover:scale-[1.02]"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 transition duration-300 transform hover:scale-[1.02]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 transition duration-300 transform hover:scale-[1.02]"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 transition duration-300 transform hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
