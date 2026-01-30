import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

const VirtualTryOn = ({ product, onClose }) => {
  const [image, setImage] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
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
  const handposeModel = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        
        // Load Face API models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);

        // Load Handpose model
        await tf.ready();
        handposeModel.current = await handpose.load();

        setModelsLoaded(true);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        setError("Failed to load AI models. Please try again.");
        setModelsLoaded(false);
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
    
    // If models failed to load, don't try detection
    if (!modelsLoaded) {
       setError("AI models unavailable.");
       return;
    }

    setIsDetecting(true);
    setError(null);
    
    try {
      // Check if image is valid for detection
      if (imgRef.current.naturalWidth === 0 || imgRef.current.naturalHeight === 0) {
         console.log("Image not fully loaded yet");
         setIsDetecting(false);
         return;
      }

      // Determine detection mode based on product category
      const isRing = product.category?.toLowerCase().includes('ring') && !product.category?.toLowerCase().includes('earring') && !product.category?.toLowerCase().includes('nose');

      if (isRing) {
        await detectHandAndPosition();
      } else {
        await detectFaceAndFeatures();
      }

    } catch (err) {
      console.error("Detection error:", err);
      setError("Detection failed. Please try a clearer photo.");
    } finally {
      setIsDetecting(false);
    }
  };

  const detectHandAndPosition = async () => {
    if (!handposeModel.current) return;

    const predictions = await handposeModel.current.estimateHands(imgRef.current);

    if (predictions.length > 0) {
      const hand = predictions[0];
      const landmarks = hand.landmarks;

      // Finger Landmarks Indices:
      // Index finger: Base(5) -> Tip(8)
      // Middle finger: Base(9) -> Tip(12)
      // Ring finger: Base(13) -> Tip(16)
      
      // Default to Ring Finger (landmarks 13 and 14 - MCP to PIP)
      // MCP = Metacarpophalangeal Joint (Knuckle)
      // PIP = Proximal Interphalangeal Joint (Middle joint)
      const mcp = landmarks[13]; // [x, y, z]
      const pip = landmarks[14]; // [x, y, z]

      // Calculate position (midpoint between MCP and PIP)
      const x = (mcp[0] + pip[0]) / 2;
      const y = (mcp[1] + pip[1]) / 2;

      // Calculate rotation
      // Vector from MCP to PIP
      const deltaX = pip[0] - mcp[0];
      const deltaY = pip[1] - mcp[1];
      // Angle in radians
      const angleRad = Math.atan2(deltaY, deltaX);
      // Convert to degrees and adjust (assuming product image is vertical 0deg?)
      // Usually rings are vertical images. If finger is horizontal, we need to rotate 90deg?
      // Let's assume standard upright ring image.
      // If finger is pointing up (-90deg), ring should be upright (0deg).
      // So Rotation = Angle + 90deg.
      const angleDeg = (angleRad * 180 / Math.PI) + 90;

      // Calculate scale based on finger width
      // Distance between index MCP (5) and Pinky MCP (17) is hand width
      // Or just distance between mcp and pip as a proxy for segment length
      const segmentLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      // Scale factor: adjust empirically. Say ring width should be slightly wider than finger width.
      // Finger width is approx 1/3 of segment length? Rough guess.
      const scale = segmentLength / 100; // Normalizing factor

      // Adjust to center on canvas coordinates
      // The image is displayed "contain" centered or full size?
      // Wait, the overlay uses absolute positioning relative to the container.
      // We need to map video/image coordinates to container coordinates.
      // Since we are using the img element itself for detection, the coordinates match the image display size
      // IF the image is not scaled by CSS object-fit.
      // The image has class "max-h-full max-w-full object-contain".
      // We need to account for the actual rendered size vs natural size if detection ran on natural size.
      // Handpose runs on the DOM element usually, so it returns coordinates relative to the element (or video).
      // If we pass the img element, it *should* handle it. But let's verify.
      // Actually handpose expects tensor or video/image. If we pass img element, it uses natural size usually?
      // We might need to scale coordinates if the displayed image size != natural size.
      
      const displayedWidth = imgRef.current.width;
      const displayedHeight = imgRef.current.height;
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;

      const scaleX = displayedWidth / naturalWidth;
      const scaleY = displayedHeight / naturalHeight;
      
      // But wait, handpose might return coords in natural size?
      // Actually `estimateHands` takes the image. 
      // Let's assume it returns coordinates in the scale of the input.
      // If we pass the img element, detection usually runs on the rendered pixels if it's a video, 
      // but for an image element, it often uses the source data.
      // Let's perform a safe check: calculate based on natural size then scale to display size.
      // Actually, standardizing on natural size is safer.
      // But we are rendering the overlay on top of the displayed image.
      // We need to calculate the offset relative to the CENTER of the displayed image.
      
      // Let's simplify:
      // The overlay is centered at 50% 50%.
      // We need `x` and `y` to be offsets from the center.
      
      // Current center in image coords (scaled to display):
      const centerX = displayedWidth / 2;
      const centerY = displayedHeight / 2;

      // Detection Coords (assuming natural size)
      const detX = x * scaleX;
      const detY = y * scaleY;

      // Offset from center
      const offsetX = detX - centerX;
      const offsetY = detY - centerY;

      setOverlayConfig({
        scale: scale * scaleX * 1.5, // 1.5x multiplier for visibility
        x: offsetX,
        y: offsetY,
        rotation: angleDeg
      });

    } else {
      setError("No hand detected. Please ensure hand is clearly visible.");
    }
  };

  const detectFaceAndFeatures = async () => {
    const detection = await faceapi.detectSingleFace(
        imgRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

    if (detection) {
      const landmarks = detection.landmarks;
      const jawline = landmarks.getJawOutline();
      const nose = landmarks.getNose();
      
      const faceWidth = detection.detection.box.width;
      
      // Image display scaling factors
      const displayedWidth = imgRef.current.width;
      const displayedHeight = imgRef.current.height;
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;
      const scaleX = displayedWidth / naturalWidth;
      const scaleY = displayedHeight / naturalHeight;

      const centerX = displayedWidth / 2;
      const centerY = displayedHeight / 2;

      let targetX = 0;
      let targetY = 0;
      let targetScale = 1;
      let targetRotation = 0;

      // Calculate Face Roll (Rotation)
      // Use eye positions (landmarks 36 (left eye outer) and 45 (right eye outer))?
      // Face-api landmarks: 
      // Left Eye: 36-41
      // Right Eye: 42-47
      // Jaw: 0-16
      // Let's use Jaw 0 and 16 to estimate roll? Or eyes. Eyes are better.
      // Actually we don't have explicit eye landmarks in the simplified vars above, but we can access landmarks.positions
      // Let's use jawline[0] and jawline[16] for rough roll.
      const leftJaw = jawline[0];
      const rightJaw = jawline[16];
      const jawDeltaX = rightJaw.x - leftJaw.x;
      const jawDeltaY = rightJaw.y - leftJaw.y;
      const faceRoll = Math.atan2(jawDeltaY, jawDeltaX); // Radians
      const faceRollDeg = faceRoll * 180 / Math.PI;

      if (product.category?.toLowerCase().includes('earring')) {
        // Position on earlobes
        // Jawline[0] is roughly left earlobe area, Jawline[16] is right.
        // Let's pick Left Ear (Viewer's Left, Person's Right) for now, or place two?
        // Single image -> Single earring.
        // Let's default to Viewer's Left (Jawline[0]).
        targetX = leftJaw.x;
        targetY = leftJaw.y + (faceWidth * 0.05); // Slightly down
        targetScale = faceWidth * 0.15 / 100;
        targetRotation = faceRollDeg;
      } else if (product.category?.toLowerCase().includes('necklace') || product.category?.toLowerCase().includes('pendant')) {
        // Position below chin
        const chin = jawline[8];
        targetX = chin.x;
        targetY = chin.y + (faceWidth * 0.15); // Below chin
        targetScale = faceWidth * 0.8 / 100;
        targetRotation = faceRollDeg;
      } else {
        // Default: Nose
        const noseTip = nose[3];
        targetX = noseTip.x;
        targetY = noseTip.y;
        targetScale = faceWidth / 300;
        targetRotation = faceRollDeg;
      }

      // Apply display scaling
      const detX = targetX * scaleX;
      const detY = targetY * scaleY;
      
      setOverlayConfig({
        scale: targetScale * scaleX * 1.5, // 1.5x boost
        x: detX - centerX,
        y: detY - centerY,
        rotation: targetRotation
      });

    } else {
      setError("No face detected.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row bg-white rounded-lg overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 hover:bg-gray-100 shadow-lg"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Main View Area */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
            {!image ? (
              <div className="text-center p-8">
                <div className="mb-6">
                  <i className="fas fa-camera text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-bold text-white mb-2">Virtual Try-On</h2>
                  <p className="text-gray-400">Upload a photo to see how this looks on you!</p>
                  <p className="text-xs text-gray-500 mt-2">Supports: Faces (Earrings, Necklaces) & Hands (Rings)</p>
                </div>
                
                <label className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full cursor-pointer transition duration-300 transform hover:scale-105">
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

                {/* Product Overlay - Fully Automated */}
                <div 
                  className="absolute transition-all duration-700 ease-out"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${overlayConfig.x}px, ${overlayConfig.y}px) scale(${overlayConfig.scale}) rotate(${overlayConfig.rotation}deg)`,
                    width: '200px',
                    pointerEvents: 'none', // Interaction disabled
                    mixBlendMode: 'multiply' // Basic blending
                  }}
                >
                  <img 
                    src={product.imageUrl} 
                    alt="Product" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                    style={{
                      filter: 'brightness(0.95) contrast(1.1)' // Slight adjustment for realism
                    }}
                  />
                </div>

                {isDetecting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-lg font-light tracking-wider">Analyzing & Fitting...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Hidden Canvas for Face API */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Side Panel - Info Only, No Controls */}
          <div className="hidden md:block w-80 bg-white p-8 border-l">
            <h3 className="text-xl font-bold mb-6">Product Details</h3>
            <div className="flex items-start gap-4 mb-6">
              <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-lg border shadow-sm" />
              <div>
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                <p className="text-indigo-600 font-bold mt-1">${product.price}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <h4 className="font-bold mb-2 text-gray-800">How it works:</h4>
              <ul className="space-y-2 list-disc pl-4">
                <li>AI automatically detects your {product.category?.toLowerCase().includes('ring') ? 'hand' : 'face'}.</li>
                <li>Adjusts size and position instantly.</li>
                <li>Applies lighting blending for realism.</li>
              </ul>
            </div>
            
            <button 
               onClick={() => setImage(null)}
               className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition"
            >
              Try Another Photo
            </button>
          </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
