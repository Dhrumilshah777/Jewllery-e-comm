import { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';

const Gallery = () => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  // For now, we can just fetch products and display their images as a gallery
  // or we could have a dedicated gallery endpoint. 
  // Since no specific requirement was given for content, I'll display product images.
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const { data } = await axios.get('/api/products?limit=20');
        // Extract images from products
        const productImages = data.products ? data.products.map(p => ({
          id: p._id,
          url: p.imageUrl,
          name: p.name
        })) : data.map(p => ({
          id: p._id,
          url: p.imageUrl,
          name: p.name
        }));
        setImages(productImages);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-wide uppercase">Gallery</h1>
        <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="relative group overflow-hidden shadow-lg aspect-[4/5] bg-gray-100">
            <img 
              src={image.url} 
              alt={image.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <span className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                {image.name}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No images found in the gallery.
        </div>
      )}
    </div>
  );
};

export default Gallery;
