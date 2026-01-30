import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const VirtualTryOn = ({ product, onClose }) => {
  const [image, setImage] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  
  const [overlayConfig, setOverlayConfig] = useState({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0
  });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        setError("Failed to load AI models. Manual mode enabled.");
        setIsModelLoading(false);
      }
    };
    loadModels();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setOverlayConfig({ scale: 1, x: 0, y: 0, rotation: 0 });
      setError(null);
    }
  };

  const detectFaceAndPosition = async () => {
    if (!imgRef.current || !canvasRef.current || isModelLoading) return;
    
    setIsDetecting(true);
    setError(null);
    
    try {
      // Detect face
      const detection = await faceapi.detectSingleFace(
        imgRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (detection) {
        const landmarks = detection.landmarks;
        const jawline = landmarks.getJawOutline();
        const nose = landmarks.getNose();
        
        const faceWidth = detection.detection.box.width;
        let newConfig = { ...overlayConfig };
        
        if (product.category?.toLowerCase().includes('earring')) {
          const leftEarArea = jawline[0];
          newConfig.x = leftEarArea.x - (faceWidth * 0.2);
          newConfig.y = leftEarArea.y;
          newConfig.scale = faceWidth * 0.15 / 100;
        } else if (product.category?.toLowerCase().includes('necklace') || product.category?.toLowerCase().includes('pendant')) {
          const chin = jawline[8];
          newConfig.x = chin.x - (faceWidth * 0.5);
          newConfig.y = chin.y + (faceWidth * 0.2);
          newConfig.scale = faceWidth * 0.8 / 100;
        } else {
          const noseTip = nose[3];
          newConfig.x = noseTip.x;
          newConfig.y = noseTip.y;
        }

        setOverlayConfig(prev => ({
          ...prev,
          scale: faceWidth / 300
        }));
      } else {
        setError("No face detected. Please adjust manually.");
      }
    } catch (err) {
      console.error("Detection error:", err);
      setError("Face detection failed. Please adjust manually.");
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold font-sans uppercase tracking-widest">Virtual Try-On</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
            {!image ? (
              <div className="text-center p-8">
                <div className="mb-4">
                  <i className="fas fa-camera text-4xl text-gray-400"></i>
                </div>
                <p className="mb-4 text-gray-600">Upload a photo to see how this looks on you</p>
                <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-none uppercase tracking-wider font-semibold hover:bg-gray-800 transition">
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
                <img 
                  ref={imgRef}
                  src={image} 
                  alt="User upload" 
                  className="max-h-full max-w-full object-contain"
                  onLoad={() => detectFaceAndPosition()}
                />
                
                {/* Error Message */}
                {error && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-20 text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Product Overlay */}
                <div 
                  className="absolute cursor-move"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${overlayConfig.x}px, ${overlayConfig.y}px) scale(${overlayConfig.scale}) rotate(${overlayConfig.rotation}deg)`,
                    width: '200px', // Base width
                    pointerEvents: 'none' // Let clicks pass through for now, or implement drag
                  }}
                >
                  <img 
                    src={product.imageUrl} 
                    alt="Product" 
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                </div>

                {isDetecting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                      <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
                      <p>Detecting face & aligning...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Hidden Canvas for Face API */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="w-full md:w-80 bg-white p-6 border-l overflow-y-auto z-10">
            <div className="mb-6">
              <h3 className="font-bold mb-2">Product</h3>
              <div className="flex items-center gap-4">
                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded border" />
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
            </div>

            {image && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Size</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="3" 
                    step="0.1" 
                    value={overlayConfig.scale}
                    onChange={(e) => setOverlayConfig({...overlayConfig, scale: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Position X</label>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200" 
                    value={overlayConfig.x}
                    onChange={(e) => setOverlayConfig({...overlayConfig, x: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Position Y</label>
                  <input 
                    type="range" 
                    min="-200" 
                    max="200" 
                    value={overlayConfig.y}
                    onChange={(e) => setOverlayConfig({...overlayConfig, y: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Rotation</label>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={overlayConfig.rotation}
                    onChange={(e) => setOverlayConfig({...overlayConfig, rotation: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div className="pt-4 border-t">
                  <label className="cursor-pointer block w-full text-center border border-gray-300 py-2 rounded text-sm hover:bg-gray-50 transition">
                    Change Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            )}

            {isModelLoading && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                Loading AI Models...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
