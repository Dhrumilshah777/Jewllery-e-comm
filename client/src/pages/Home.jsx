import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { useQuery } from '@tanstack/react-query';

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Query functions
  const fetchSlides = async () => {
    const { data } = await axios.get('/api/slides');
    return data;
  };

  const fetchTrendyProducts = async () => {
    const { data } = await axios.get('/api/products?isTrendy=true');
    return data;
  };

  const fetchPopularCategories = async () => {
    const { data } = await axios.get('/api/popular-categories');
    return data;
  };

  const fetchHomeBanner = async () => {
    const { data } = await axios.get('/api/home-banner');
    return data;
  };

  const fetchPromoBanner = async () => {
    const { data } = await axios.get('/api/promo-banner');
    return data;
  };

  const fetchWishlist = async () => {
    if (!user) return new Set();
    const { data } = await axios.get('/api/users/profile', { withCredentials: true });
    return new Set(data.wishlist.filter(item => item !== null).map(item => item._id));
  };

  // Queries
  const { data: slides = [], isLoading: slidesLoading } = useQuery({
    queryKey: ['slides'],
    queryFn: fetchSlides
  });

  const { data: trendyCollection = [], isLoading: trendyLoading } = useQuery({
    queryKey: ['trendyProducts'],
    queryFn: fetchTrendyProducts
  });

  const { data: popularCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['popularCategories'],
    queryFn: fetchPopularCategories
  });

  const { data: homeBanner, isLoading: homeBannerLoading } = useQuery({
    queryKey: ['homeBanner'],
    queryFn: fetchHomeBanner
  });

  const { data: promoBanner, isLoading: promoBannerLoading } = useQuery({
    queryKey: ['promoBanner'],
    queryFn: fetchPromoBanner
  });

  const { data: wishlist = new Set(), refetch: refetchWishlist } = useQuery({
    queryKey: ['wishlist', user?._id],
    queryFn: fetchWishlist,
    enabled: !!user // Only run if user exists
  });

  const loading = slidesLoading || trendyLoading || categoriesLoading || homeBannerLoading || promoBannerLoading;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    // React-slick sometimes needs a resize after data loads
    const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Update wishlist when user changes
  useEffect(() => {
    if (user) {
      refetchWishlist();
    }
  }, [user, refetchWishlist]);


  if (loading) {
    return <Spinner />;
  }

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent modal close or navigation
    
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

  const openModal = (e, product) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  const trendySettings = {
    dots: true,
    infinite: Math.min(trendyCollection.length, 4) > slidesForWidth(viewportWidth),
    speed: 500,
    slidesToShow: slidesForWidth(viewportWidth),
    slidesToScroll: 1,
    autoplay: trendyCollection.length > 1,
    autoplaySpeed: 3000,
    arrows: false,
    appendDots: dots => (
      <ul style={{ bottom: "-85px" }}>
        {dots}
      </ul>
    ),
    dotsClass: "slick-dots"
  };

  function slidesForWidth(w) {
    if (w < 640) return 2;
    if (w < 768) return 2;
    if (w < 1024) return 3;
    return 4;
  }

  const getCategorySettings = (len) => {
    const baseShow = Math.min(6, Math.max(1, len || 1));
    return {
      dots: true,
      infinite: len > baseShow,
      speed: 500,
      slidesToShow: baseShow,
      slidesToScroll: 1,
      autoplay: len > 1,
      autoplaySpeed: 3000,
      arrows: false,
      appendDots: dots => (
        <ul style={{ bottom: "-85px" }}>
          {dots}
        </ul>
      ),
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: Math.min(5, Math.max(1, len || 1)),
          }
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(4, Math.max(1, len || 1)),
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: Math.min(3, Math.max(1, len || 1)),
          }
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: Math.min(2, Math.max(1, len || 1)),
          }
        }
      ]
    };
  };

  // Removed blocking loading state to ensure content always renders
  // if (slides.length === 0 && promoBanner === null && homeBanner === null) {
  //   return (
  //     <div className="flex justify-center items-center h-[500px]">
  //       <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-12">
      {/* Hero Carousel Section */}
      <section className="overflow-hidden shadow-2xl">
        {slides.length > 0 ? (
          <Slider {...settings}>
            {slides.map((slide) => (
              <div key={slide._id} className="relative h-[450px] md:h-[550px]">
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
                    className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 transition duration-300"
                  >
                    Shop Collection
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="relative h-[450px] md:h-[550px]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop)` }}
            >
              <div className="absolute inset-0 bg-black opacity-40"></div>
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4 space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">Exquisite Jewelry</h1>
              <p className="text-xl max-w-2xl mx-auto">
                Discover our new collection
              </p>
              <Link 
                to="/products" 
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 transition duration-300"
              >
                Shop Collection
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
            <img
              src={promoBanner?.panel1Image || "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1600&auto=format&fit=crop"}
              alt={promoBanner?.panel1Title || "Jewelry Charm Rings"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="px-6 md:px-8">
                <div className="text-xs tracking-widest text-white uppercase">New Collection</div>
                <h3 className="mt-2 text-2xl md:text-3xl font-semibold text-white">{promoBanner?.panel1Title || "& Jewelry Charm Rings"}</h3>
                <Link
                  to={promoBanner?.panel1Link || "/products?category=Rings"}
                  className="mt-4 inline-block border border-white px-4 py-2 text-white hover:bg-white hover:text-gray-900 transition"
                >
                  SHOP NOW
                </Link>
              </div>
            </div>
          </div>
          <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
            <img
              src={promoBanner?.panel2Image || "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1600&auto=format&fit=crop"}
              alt={promoBanner?.panel2Title || "Necklaces Body Jewels"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-6 md:px-8 text-center">
                <div className="text-xs tracking-widest text-gray-900 uppercase">Flat Discount</div>
                <h3 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">{promoBanner?.panel2Title || "& Necklaces Body Jewels"}</h3>
                <Link
                  to={promoBanner?.panel2Link || "/products?category=Necklaces"}
                  className="mt-4 inline-block border border-gray-900 px-4 py-2 text-gray-900 hover:bg-gray-900 hover:text-white transition"
                >
                  SHOP NOW
                </Link>
              </div>
            </div>
          </div>
          <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
            <img
              src={promoBanner?.panel3Image || "https://images.unsplash.com/photo-1616712134411-27106b9872d6?q=80&w=1600&auto=format&fit=crop"}
              alt={promoBanner?.panel3Title || "Desk The Hals"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-end">
              <div className="px-6 md:px-8 text-right">
                <div className="text-xs tracking-widest text-gray-900 uppercase">Fashion 2021</div>
                <h3 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">{promoBanner?.panel3Title || "Just Lunched Desk The Hals"}</h3>
                <Link
                  to={promoBanner?.panel3Link || "/products?category=Bracelets"}
                  className="mt-4 inline-block border border-gray-900 px-4 py-2 text-gray-900 hover:bg-gray-900 hover:text-white transition"
                >
                  SEE MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-12 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10 font-sans">Popular Categories</h2>
        <div className="px-4 max-w-7xl mx-auto">
          {popularCategories.length > 0 ? (
            <Slider {...getCategorySettings(popularCategories.length)}>
              {popularCategories.map((category) => (
                <div key={category._id} className="px-2">
                  <Link to={`/products?category=${encodeURIComponent(category.name.trim())}`} className="flex flex-col items-center group cursor-pointer">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <span className="text-xs md:text-sm font-bold tracking-widest text-gray-800 uppercase group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </span>
                  </Link>
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-center text-gray-500">No popular categories found.</p>
          )}
        </div>
      </section>
      
      

      <section className="py-8 px-2 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-6">
          <div className="h-px bg-gray-200 flex-1 max-w-24" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-center font-sans uppercase tracking-widest">
            Trendy Collection
          </h2>
          <div className="h-px bg-gray-200 flex-1 max-w-24" />
        </div>
        <p className="mt-2 text-center text-gray-500 text-xs sm:text-sm font-sans">
          Collect your loves with our newest arrivals
        </p>

        <div className="mt-10 mb-16">
          <Slider key={`trendy-${slidesForWidth(viewportWidth)}-${trendyCollection.length}`} {...trendySettings}>
            {trendyCollection.map((item) => (
              <div key={item._id} className="px-2">
                <div className="group block relative">
                  <div className="relative bg-gray-100 aspect-square overflow-hidden">
                    <Link to={`/products/${item._id}`} className="block w-full h-full cursor-pointer">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </Link>
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      {/* Quick View Icon */}
                      <button
                        onClick={(e) => openModal(e, item)}
                        className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                        title="Quick View"
                      >
                        <i className="fas fa-eye text-lg"></i>
                      </button>
                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => toggleWishlist(e, item._id)}
                        className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-red-500 hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                        title={wishlist.has(item._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        {wishlist.has(item._id) ? <i className="fas fa-heart text-red-500 text-lg"></i> : <i className="far fa-heart text-lg"></i>}
                      </button>
                    </div>
                  </div>
                  <Link to={`/products/${item._id}`}>
                    <div className="pt-4 text-center">
                      <div className="text-[10px] tracking-widest text-gray-400 uppercase">
                        {item.category}
                      </div>
                      <div className="mt-2 text-xs sm:text-sm text-gray-800">
                        {item.name}
                      </div>
                      <div className="mt-2 text-xs sm:text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      <section className="px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <img
              src={homeBanner?.leftImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop'}
              alt={homeBanner?.leftTitle || 'Ring Collection'}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="px-8 md:px-12">
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {homeBanner?.leftTitle || 'Culture of Ring Design'}
                </h3>
                <p className="mt-2 text-gray-700">
                  {homeBanner?.leftSubtitle || 'Pasha de Cartier Collection'}
                </p>
                <Link
                  to={homeBanner?.leftLink || '/products?category=Rings'}
                  className="mt-6 inline-block border border-gray-900 px-5 py-2 text-gray-900 hover:bg-gray-900 hover:text-white transition"
                >
                  SHOP MORE
                </Link>
              </div>
            </div>
          </div>
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <img
              src={homeBanner?.rightImage || 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1600&auto=format&fit=crop'}
              alt={homeBanner?.rightTitle || 'Bangles Collection'}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-end">
              <div className="px-8 md:px-12 text-right">
                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {homeBanner?.rightTitle || 'New Bangles Collection'}
                </h3>
                <p className="mt-2 text-gray-700">
                  {homeBanner?.rightSubtitle || 'Catch the highlight in the roof'}
                </p>
                <Link
                  to={homeBanner?.rightLink || '/products?category=Bracelets'}
                  className="mt-6 inline-block border border-gray-900 px-5 py-2 text-gray-900 hover:bg-gray-900 hover:text-white transition"
                >
                  SHOP MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-start md:items-center md:justify-center md:p-4 bg-transparent backdrop-blur-md" onClick={closeModal}>
          <div 
            className="bg-white w-[85%] h-full md:h-auto md:w-full md:max-w-4xl rounded-none shadow-2xl overflow-y-auto md:overflow-hidden relative animate-slide-left md:animate-popup flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-1 cursor-pointer"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>

            {/* Product Image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-transparent relative">
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.name} 
                className="w-full h-full object-contain p-4"
              />
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center text-left">
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                {selectedProduct.category}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedProduct.name}
              </h2>
              <div className="text-2xl text-indigo-600 font-semibold mb-6">
                ${selectedProduct.price}
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed line-clamp-4">
                {selectedProduct.description}
              </p>

              <div className="flex flex-col space-y-4">
                <button 
                  onClick={(e) => toggleWishlist(e, selectedProduct._id)}
                  className="flex items-center justify-center space-x-2 w-full bg-gray-900 text-white py-3 px-6 hover:bg-gray-800 transition duration-300 cursor-pointer"
                >
                  {wishlist.has(selectedProduct._id) ? (
                    <>
                      <i className="fas fa-heart text-red-500"></i>
                      <span>In Wishlist</span>
                    </>
                  ) : (
                    <>
                      <i className="far fa-heart"></i>
                      <span>Add to Wishlist</span>
                    </>
                  )}
                </button>
                
                <Link 
                  to={`/products/${selectedProduct._id}`}
                  className="text-center text-indigo-600 hover:text-indigo-800 font-medium transition duration-300 hover:underline"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
