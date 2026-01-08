import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';

const Home = () => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data } = await axios.get('/api/slides');
        setSlides(data);
      } catch (error) {
        console.error('Error fetching slides:', error);
      }
    };
    fetchSlides();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  if (slides.length === 0) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Carousel Section */}
      <section className="rounded-2xl overflow-hidden shadow-2xl">
        <Slider {...settings}>
          {slides.map((slide) => (
            <div key={slide._id} className="relative h-[500px]">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black opacity-40"></div>
              </div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4 space-y-6">
                <h1 className="text-5xl font-bold tracking-tight">{slide.title}</h1>
                <p className="text-xl max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <Link 
                  to="/products" 
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full transition duration-300"
                >
                  Shop Collection
                </Link>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Featured Categories */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Featured Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Necklaces', 'Rings', 'Earrings'].map((category) => (
            <div key={category} className="group cursor-pointer relative overflow-hidden rounded-xl shadow-lg h-64">
               <div className="absolute inset-0 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition">
                 <span className="text-2xl font-bold text-gray-800">{category}</span>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
