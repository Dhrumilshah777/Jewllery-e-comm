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
    rotation: 0,
    pitch: 0, // For 3D perspective
    yaw: 0,   // For left/right turn
    opacity: 1 // For occlusion
  });

  // For Earrings: We need dual configs (Left and Right)
  const [secondOverlayConfig, setSecondOverlayConfig] = useState(null);

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
      setOverlayConfig({ scale: 1, x: 0, y: 0, rotation: 0, pitch: 0, yaw: 0, opacity: 1 });
      setSecondOverlayConfig(null);
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

      // Calculate position: Rings sit closer to the knuckle (MCP)
      // Weighted average: 70% MCP, 30% PIP
      const x = (mcp[0] * 0.7 + pip[0] * 0.3);
      const y = (mcp[1] * 0.7 + pip[1] * 0.3);

      // Calculate rotation
      // Vector from MCP to PIP
      const deltaX = pip[0] - mcp[0];
      const deltaY = pip[1] - mcp[1];
      // Angle in radians
      const angleRad = Math.atan2(deltaY, deltaX);
      const angleDeg = (angleRad * 180 / Math.PI) + 90;

      // Calculate finger depth/tilt (Pitch)
      // If z-coordinates differ significantly, the finger is pointing towards/away
      // Handpose Z is relative.
      // Let's rely on 2D rotation for now, as Ring Try-On is mostly top-down.
      
      const segmentLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const scale = segmentLength / 100; // Normalizing factor

      // ... (coordinate mapping code)
      
      const displayedWidth = imgRef.current.width;
      const displayedHeight = imgRef.current.height;
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;

      const scaleX = displayedWidth / naturalWidth;
      const scaleY = displayedHeight / naturalHeight;
      
      const centerX = displayedWidth / 2;
      const centerY = displayedHeight / 2;

      // Detection Coords
      const detX = x * scaleX;
      const detY = y * scaleY;

      setOverlayConfig({
        scale: scale * scaleX * 1.5,
        x: detX - centerX,
        y: detY - centerY,
        rotation: angleDeg,
        pitch: 0,
        yaw: 0,
        opacity: 1
      });
      setSecondOverlayConfig(null);

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
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      
      const faceWidth = detection.detection.box.width;
      const faceHeight = detection.detection.box.height; // More reliable for vertical scaling
      
      // --- Pose Estimation (Geometric) ---
      // 1. Roll (Tilt head left/right): Angle between eyes
      const leftEyeCenter = { x: (leftEye[0].x + leftEye[3].x)/2, y: (leftEye[0].y + leftEye[3].y)/2 };
      const rightEyeCenter = { x: (rightEye[0].x + rightEye[3].x)/2, y: (rightEye[0].y + rightEye[3].y)/2 };
      const dX = rightEyeCenter.x - leftEyeCenter.x;
      const dY = rightEyeCenter.y - leftEyeCenter.y;
      const rollDeg = Math.atan2(dY, dX) * (180 / Math.PI);

      // 2. Yaw (Turn head left/right): Ratio of Nose-to-Jaw distances
      const noseTip = nose[3];
      const leftJaw = jawline[0];  // User's right jaw (Viewer's left)
      const rightJaw = jawline[16]; // User's left jaw (Viewer's right)
      
      const distToLeftJaw = Math.sqrt(Math.pow(noseTip.x - leftJaw.x, 2) + Math.pow(noseTip.y - leftJaw.y, 2));
      const distToRightJaw = Math.sqrt(Math.pow(noseTip.x - rightJaw.x, 2) + Math.pow(noseTip.y - rightJaw.y, 2));
      
      // Yaw Factor: -1 (Full Left) to 1 (Full Right)
      const totalJawWidth = distToLeftJaw + distToRightJaw;
      const yawFactor = (distToRightJaw - distToLeftJaw) / totalJawWidth; 
      const yawDeg = yawFactor * 60; // Max ~60 degree turn

      // 3. Pitch (Nod up/down): Ratio of Eye-Nose vs Nose-Mouth (Jaw Bottom)
      const jawBottom = jawline[8];
      const eyeMidY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
      const noseY = noseTip.y;
      const mouthY = jawBottom.y; 
      
      const upperFaceH = noseY - eyeMidY;
      const lowerFaceH = mouthY - noseY;
      const pitchRatio = upperFaceH / lowerFaceH;
      const pitchDeg = (1 - pitchRatio) * 45; 

      // --- Display Scaling ---
      const displayedWidth = imgRef.current.width;
      const displayedHeight = imgRef.current.height;
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;
      const scaleX = displayedWidth / naturalWidth;
      const scaleY = displayedHeight / naturalHeight;
      const centerX = displayedWidth / 2;
      const centerY = displayedHeight / 2;

      // --- Category Logic ---
      // Combine category and name for better detection
      const productType = (product.category + " " + product.name).toLowerCase();
      
      if (productType.includes('earring')) {
        // --- Dual Earring Logic ---
        // Refined Anchoring: Jaw[0]/[16] are top of jaw. Earlobes are slightly lower and outward.
        
        const earOffsetX = faceWidth * 0.05; // Push outward
        const earOffsetY = faceHeight * 0.15; // Push down from top of jaw to lobe

        // Left Ear (Viewer's Left)
        const leftEarX = leftJaw.x - (earOffsetX * Math.cos(rollDeg * Math.PI/180));
        const leftEarY = leftJaw.y + earOffsetY; 
        
        // Right Ear (Viewer's Right)
        const rightEarX = rightJaw.x + (earOffsetX * Math.cos(rollDeg * Math.PI/180));
        const rightEarY = rightJaw.y + earOffsetY;

        const earringScale = faceWidth * 0.12 / 100; // Slightly smaller for realism
        
        // Occlusion Logic - Tighter thresholds
        // If Looking Right (Yaw > 0), Left Ear (Viewer Left) gets hidden quickly.
        const leftOpacity = yawFactor > 0.35 ? 0 : 1;
        const rightOpacity = yawFactor < -0.35 ? 0 : 1;

        // Config 1: Left Ear
        setOverlayConfig({
          scale: earringScale * scaleX * 1.5,
          x: (leftEarX * scaleX) - centerX,
          y: (leftEarY * scaleY) - centerY,
          rotation: rollDeg,
          pitch: pitchDeg,
          yaw: yawDeg,
          opacity: leftOpacity
        });

        // Config 2: Right Ear
        setSecondOverlayConfig({
          scale: earringScale * scaleX * 1.5,
          x: (rightEarX * scaleX) - centerX,
          y: (rightEarY * scaleY) - centerY,
          rotation: rollDeg,
          pitch: pitchDeg,
          yaw: yawDeg,
          opacity: rightOpacity
        });

      } else if (productType.includes('necklace') || productType.includes('pendant') || productType.includes('set') || productType.includes('chain')) {
        // --- Necklace / Pendant / Set Logic ---
        // Anchor: Estimate Suprasternal Notch (Collarbone center)
        // Chin (Jaw[8]) is too high.
        // Average neck length is roughly 1/3 to 1/2 of face height.
        
        const chin = jawline[8];
        const neckY = chin.y + (faceHeight * 0.55); // Moved lower (was 0.45)
        
        // Perspective adjustment:
        // Necklaces rest on the chest. They don't pitch up/down with the head as much.
        // They do rotate (roll) with the body.
        
        const necklaceScale = faceWidth * 0.9 / 100; // Slightly larger
        
        // Offset Y for image centering
        // If the image is a full bust/stand, the "neck" part is near the top.
        // We want the TOP QUARTER of the image to be at neckY.
        // Default center is 50%. So we shift down by ~25% of image height?
        // Hard to know image aspect ratio without loading, but we can guess.
        const verticalShift = 50; // Pixels down

        setOverlayConfig({
          scale: necklaceScale * scaleX * 1.2,
          x: (chin.x * scaleX) - centerX,
          y: (neckY * scaleY) - centerY + verticalShift,
          rotation: rollDeg,     // Follows body tilt
          pitch: pitchDeg * 0.1, // Dampened pitch (chest is stable)
          yaw: yawDeg * 0.5,     // Dampened yaw (neck turns less than head)
          opacity: 1
        });
        setSecondOverlayConfig(null);

      } else {
        // --- Default (Face Center/Chin) ---
        // Fallback to chin/neck area instead of Nose, as it's safer for unknown jewelry
        const chin = jawline[8];
        const targetX = chin.x;
        const targetY = chin.y + (faceHeight * 0.3); // Neck area
        
        setOverlayConfig({
          scale: (faceWidth / 300) * scaleX * 1.5,
          x: (targetX * scaleX) - centerX,
          y: (targetY * scaleY) - centerY,
          rotation: rollDeg,
          pitch: pitchDeg,
          yaw: yawDeg,
          opacity: 1
        });
        setSecondOverlayConfig(null);
      }

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
                    transform: `translate(-50%, -50%) translate(${overlayConfig.x}px, ${overlayConfig.y}px) rotate(${overlayConfig.rotation}deg) scale(${overlayConfig.scale}) perspective(1000px) rotateX(${overlayConfig.pitch}deg) rotateY(${overlayConfig.yaw}deg)`,
                    width: '200px',
                    pointerEvents: 'none',
                    mixBlendMode: 'multiply', // Restore multiply for white background handling
                    zIndex: 10,
                    opacity: overlayConfig.opacity
                  }}
                >
                  <img 
                    src={product.imageUrl} 
                    alt="Product" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                    style={{
                      filter: 'contrast(1.2) brightness(1.1)' // Enhance contrast to make jewelry pop against skin
                    }}
                  />
                </div>

                {/* Second Overlay (Right Ear for Earrings) */}
                {secondOverlayConfig && (
                  <div 
                    className="absolute transition-all duration-700 ease-out"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${secondOverlayConfig.x}px, ${secondOverlayConfig.y}px) rotate(${secondOverlayConfig.rotation}deg) scale(${secondOverlayConfig.scale}) perspective(1000px) rotateX(${secondOverlayConfig.pitch}deg) rotateY(${secondOverlayConfig.yaw}deg)`,
                      width: '200px',
                      pointerEvents: 'none',
                      zIndex: 10,
                      mixBlendMode: 'multiply',
                      opacity: secondOverlayConfig.opacity
                    }}
                  >
                    <img 
                      src={product.imageUrl} 
                      alt="Product" 
                      className="w-full h-full object-contain drop-shadow-2xl"
                      style={{
                        filter: 'brightness(0.95) contrast(1.1)',
                        transform: 'scaleX(-1)' // Mirror image for symmetry if needed, or keep same
                      }}
                    />
                  </div>
                )}

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
