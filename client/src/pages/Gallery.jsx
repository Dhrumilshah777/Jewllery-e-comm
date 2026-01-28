import { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';

const Gallery = () => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'General',
    'Rings',
    'Necklaces',
    'Earrings',
    'Bracelets',
    'Charm & Dangles',
    'Gift Ideas'
  ];

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const { data } = await axios.get('/api/gallery');
        const galleryImages = data.map(item => ({
          id: item._id,
          url: item.imageUrl,
          name: item.title,
          category: item.category
        }));
        setImages(galleryImages);
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

  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-wide uppercase">Gallery</h1>
        <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="relative group overflow-hidden shadow-lg bg-gray-100">
            <img 
              src={image.url} 
              alt={image.name} 
              className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <span className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                {image.name}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {filteredImages.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No images found in this category.
        </div>
      )}
    </div>
  );
};

export default Gallery;
