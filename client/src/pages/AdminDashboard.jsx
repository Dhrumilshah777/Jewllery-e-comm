import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [activeTab, setActiveTab] = useState('manage');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    imageUrl: '',
    stock: ''
  });
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    subtitle: '',
    image: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
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

  useEffect(() => {
    fetchProducts();
    fetchSlides();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        stock: ''
      });
      fetchProducts();
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
      fetchProducts();
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
      } catch (error) {
        toast.error('Error deleting slide');
      }
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
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
      fetchProducts();
    } catch (error) {
      toast.error('Error updating product');
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
          className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
            activeTab === 'manage'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
            activeTab === 'add'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Add New Product
        </button>
        <button
          onClick={() => setActiveTab('slides')}
          className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
            activeTab === 'slides'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Manage Slides
        </button>
      </div>
      
      {activeTab === 'slides' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                  Add Slide
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Current Slides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slides.map((slide) => (
                <div key={slide._id} className="border rounded-lg overflow-hidden shadow-sm relative group">
                  <img src={slide.image} alt={slide.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{slide.title}</h3>
                    <p className="text-gray-600">{slide.subtitle}</p>
                  </div>
                  <button
                    onClick={() => handleSlideDelete(slide._id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
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
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              rows="4"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
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
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-300"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
      )}

      {activeTab === 'manage' && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Manage Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">${product.price}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-md transition duration-300 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition duration-300"
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh] animate-scale-in">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  value={editingProduct.imageUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                  className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
              
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition duration-300 transform hover:scale-[1.02]"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition duration-300 transform hover:scale-[1.02]"
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition duration-300 transform hover:scale-[1.02]"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition duration-300 transform hover:scale-[1.02]"
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
