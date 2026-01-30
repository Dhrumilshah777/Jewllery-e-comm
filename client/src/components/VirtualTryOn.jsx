import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const VirtualTryOn = ({ product, onClose }) => {
  const [image, setImage] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
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
        setIsModelLoading(false);
        // Fallback to manual mode if models fail
      }
    };
    loadModels();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setOverlayConfig({ scale: 1, x: 0, y: 0, rotation: 0 }); // Reset config
    }
  };

  const detectFaceAndPosition = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    
    setIsDetecting(true);
    
    // Detect face
    const detection = await faceapi.detectSingleFace(
      imgRef.current, 
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks();

    if (detection) {
      const landmarks = detection.landmarks;
      const jawline = landmarks.getJawOutline();
      const nose = landmarks.getNose();
      
      // Basic logic for placement based on product category
      // This is a simplified heuristic
      let newConfig = { ...overlayConfig };
      
      const faceWidth = detection.detection.box.width;
      
      if (product.category?.toLowerCase().includes('earring')) {
        // Position near ear (approximate with jawline start/end)
        // Default to left ear for single earring or generic placement
        const leftEarArea = jawline[0];
        newConfig.x = leftEarArea.x - (faceWidth * 0.2); // Offset
        newConfig.y = leftEarArea.y;
        newConfig.scale = faceWidth * 0.15 / 100; // Rough scale estimation
      } else if (product.category?.toLowerCase().includes('necklace') || product.category?.toLowerCase().includes('pendant')) {
        // Position below chin
        const chin = jawline[8];
        newConfig.x = chin.x - (faceWidth * 0.5); // Center horizontally roughly
        newConfig.y = chin.y + (faceWidth * 0.2); // Below chin
        newConfig.scale = faceWidth * 0.8 / 100;
      } else {
        // Default: Center on nose
        const noseTip = nose[3];
        newConfig.x = noseTip.x;
        newConfig.y = noseTip.y;
      }

      // Adjust for canvas coordinates if needed, but here we render product on top
      // Actually, we'll just update the config to "suggest" a position
      // For now, let's just center it relative to the detected feature
      
      // Since we are rendering the product image via CSS or Canvas, we need to map these coordinates
      // For simplicity in this v1, we'll just center the product on the face and let user adjust
      // or use the calculated values if they seem reasonable.
      
      // Let's just set a "detected" flag and let the user fine-tune, 
      // but try to set initial scale based on face size
      setOverlayConfig(prev => ({
        ...prev,
        scale: faceWidth / 300 // Normalize scale based on face width
      }));
    }
    
    setIsDetecting(false);
  };

  useEffect(() => {
    if (image && !isModelLoading) {
      // Small delay to ensure image is loaded in DOM
      setTimeout(detectFaceAndPosition, 500);
    }
  }, [image, isModelLoading]);

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
                />
                
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
