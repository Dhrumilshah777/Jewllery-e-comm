import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const VirtualTryOn = ({ product, onClose }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  
  // Mode state: 'upload' (default) or 'camera'
  const [mode, setMode] = useState('upload');
  const [uploadedImage, setUploadedImage] = useState(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  // Jewelry image ref
  const jewelryImgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load product image
  useEffect(() => {
    const img = new Image();
    // Removed crossOrigin to avoid CORS issues with images from external domains that don't send headers
    // img.crossOrigin = 'Anonymous'; 
    img.src = product.imageUrl;
    img.onload = () => {
      console.log("Jewelry image loaded:", product.imageUrl);
      jewelryImgRef.current = img;
      setImageLoaded(true);
      setDebugInfo(""); // Clear error if successful
    };
    img.onerror = (err) => {
      console.error("Error loading jewelry image:", err);
      // Try a backup method or just show error
      setDebugInfo("Error loading product image. Check console for CORS or URL issues.");
    };
  }, [product]);

  const onResults = useCallback((results) => {
    if (!canvasRef.current) return;

    // Determine dimensions based on input
    const width = results.image.width;
    const height = results.image.height;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    
    // Draw the image/video frame
    ctx.drawImage(results.image, 0, 0, width, height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      if (mode === 'upload') setDebugInfo(""); // Clear error if face found

      const landmarks = results.multiFaceLandmarks[0];
      const productType = (product.category + " " + product.name).toLowerCase();
      
      // Draw debug points for face detection verification
      const noseTip = landmarks[1];
      ctx.beginPath();
      ctx.arc(noseTip.x * width, noseTip.y * height, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#00FF00'; // Green dot to confirm detection
      ctx.fill();

      // Calculate face geometry
      const leftCheek = landmarks[234];
      const rightCheek = landmarks[454];

      // Calculate yaw (rotation around Y axis)
      const yaw = (rightCheek.z - leftCheek.z) * 10; 
      
      // Calculate roll (tilt head left/right)
      const roll = Math.atan2(rightCheek.y - leftCheek.y, rightCheek.x - leftCheek.x);

      if (jewelryImgRef.current) {
        if (productType.includes('earring')) {
          renderEarrings(ctx, landmarks, jewelryImgRef.current, width, height, yaw, roll);
        } else if (productType.includes('necklace') || productType.includes('pendant') || productType.includes('set') || productType.includes('chain') || productType.includes('mangalsutra')) {
          renderNecklace(ctx, landmarks, jewelryImgRef.current, width, height, yaw, roll);
        }
      }
    } else {
      if (mode === 'upload') {
        setDebugInfo("No face detected. Please use a clear front-facing photo.");
      }
    }
    ctx.restore();
    setIsLoading(false);
  }, [product, imageLoaded, mode]);

  // ... (renderEarrings, renderNecklace, getFaceScale, drawRotatedImage remain same)

  const renderEarrings = (ctx, landmarks, img, width, height, yaw, roll) => {
    // Left Ear Area: 234 (cheek), 93 (jaw) - approximating ear lobe
    // Right Ear Area: 454 (cheek), 323 (jaw)
    
    // Using landmarks closer to ear lobes
    const leftEar = landmarks[177]; // Approximation
    const rightEar = landmarks[401]; // Approximation
    
    const scaleFactor = getFaceScale(landmarks, width);
    const earringSize = 150 * scaleFactor; // Increased base size

    // Left Earring
    if (yaw > -0.2) { 
      drawRotatedImage(
        ctx, 
        img, 
        leftEar.x * width - earringSize / 2, 
        leftEar.y * height, 
        earringSize, 
        earringSize, 
        roll
      );
    }

    // Right Earring
    if (yaw < 0.2) { 
      drawRotatedImage(
        ctx, 
        img, 
        rightEar.x * width - earringSize / 2, 
        rightEar.y * height, 
        earringSize, 
        earringSize, 
        roll
      );
    }
  };

  const renderNecklace = (ctx, landmarks, img, width, height, yaw, roll) => {
    // Chin: 152
    const chin = landmarks[152];
    
    const scaleFactor = getFaceScale(landmarks, width);
    const necklaceWidth = 350 * scaleFactor; // Slightly larger
    const necklaceHeight = necklaceWidth * (img.height / img.width);

    // Position below chin
    const x = chin.x * width - necklaceWidth / 2;
    const y = chin.y * height + (10 * scaleFactor); 

    drawRotatedImage(ctx, img, x, y, necklaceWidth, necklaceHeight, roll);
  };

  const getFaceScale = (landmarks, width) => {
    // Distance between cheekbones as scale reference
    const left = landmarks[234];
    const right = landmarks[454];
    const dx = (right.x - left.x) * width;
    const dy = (right.y - left.y) * width; 
    const distance = Math.sqrt(dx*dx + dy*dy);
    return distance / 300; // Adjusted normalization factor
  };

  const drawRotatedImage = (ctx, image, x, y, width, height, rotation) => {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation);
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  };

  // Initialize FaceMesh
  useEffect(() => {
    const faceMesh = new FaceMesh({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
    faceMeshRef.current = faceMesh;

    return () => {
      faceMesh.close();
    };
  }, [onResults]);

  // Handle Camera Mode
  useEffect(() => {
    if (mode === 'camera' && webcamRef.current && webcamRef.current.video) {
       setIsLoading(true);
       const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video && faceMeshRef.current) {
            await faceMeshRef.current.send({image: webcamRef.current.video});
          }
        },
        width: 640,
        height: 480
      });
      camera.start();
      cameraRef.current = camera;
    } else {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    }
  }, [mode]);

  // Handle Upload Mode
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    if (mode === 'upload' && uploadedImage && faceMeshRef.current) {
      const img = new Image();
      img.src = uploadedImage;
      img.onload = async () => {
        await faceMeshRef.current.send({image: img});
        setIsLoading(false);
      };
    }
  }, [mode, uploadedImage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-4xl h-[85vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 z-20 flex justify-between items-center bg-gray-800">
          <div className="flex space-x-4">
             <button 
               onClick={() => setMode('upload')}
               className={`px-4 py-2 rounded ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
             >
               Upload Photo
             </button>
             <button 
               onClick={() => setMode('camera')}
               className={`px-4 py-2 rounded ${mode === 'camera' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
             >
               Live Camera
             </button>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 text-white pointer-events-none">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p>Processing...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          
          {mode === 'camera' && (
             <>
               <Webcam
                ref={webcamRef}
                className="absolute opacity-0" 
                width={640}
                height={480}
                mirrored
                onUserMedia={() => setCameraPermission(true)}
                onUserMediaError={() => setCameraPermission(false)}
              />
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain transform -scale-x-100" // Mirror for camera
              />
              {cameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900">
                  <p>Camera permission denied. Please allow camera access to use this feature.</p>
                </div>
              )}
             </>
          )}

          {mode === 'upload' && (
            <>
              {!uploadedImage ? (
                <div className="flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-600 rounded-lg">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition duration-300">
                    <span>Select Photo</span>
                    <input type='file' className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <p className="mt-2 text-sm">Supported formats: JPG, PNG</p>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                   <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full object-contain" // No mirror for upload
                  />
                  <button 
                    onClick={() => { setUploadedImage(null); }}
                    className="absolute bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 z-40"
                  >
                    Upload New Photo
                  </button>
                </div>
              )}
            </>
          )}

          {debugInfo && (
             <div className="absolute bottom-20 left-4 text-red-500 bg-black/50 p-2 rounded z-30">
                {debugInfo}
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 text-white text-center">
          <p className="text-sm opacity-80">
            {mode === 'camera' ? 'Position your face in the center.' : 'Ensure your face is clearly visible in the photo.'}
            { !jewelryImgRef.current && " (Loading Product Image...)" }
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
