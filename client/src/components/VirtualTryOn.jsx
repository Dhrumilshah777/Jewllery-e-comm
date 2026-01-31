import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const VirtualTryOn = ({ product, onClose }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(null);

  // Jewelry image ref
  const jewelryImgRef = useRef(null);

  // Load product image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = product.imageUrl;
    img.onload = () => {
      jewelryImgRef.current = img;
    };
  }, [product]);

  const onResults = useCallback((results) => {
    if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    
    // Draw the video frame
    ctx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const productType = (product.category + " " + product.name).toLowerCase();
      
      // Calculate face geometry for orientation
      // Nose tip: 1, Chin: 152, Left cheek: 234, Right cheek: 454
      const nose = landmarks[1];
      const leftCheek = landmarks[234];
      const rightCheek = landmarks[454];

      // Calculate yaw (rotation around Y axis)
      // Positive yaw = looking left (from camera view), Negative = looking right
      const yaw = (rightCheek.z - leftCheek.z) * 10; 
      
      // Calculate roll (tilt head left/right)
      const roll = Math.atan2(rightCheek.y - leftCheek.y, rightCheek.x - leftCheek.x);

      if (jewelryImgRef.current) {
        if (productType.includes('earring')) {
          renderEarrings(ctx, landmarks, jewelryImgRef.current, videoWidth, videoHeight, yaw, roll);
        } else if (productType.includes('necklace') || productType.includes('pendant') || productType.includes('set') || productType.includes('chain')) {
          renderNecklace(ctx, landmarks, jewelryImgRef.current, videoWidth, videoHeight, yaw, roll);
        }
      }
    }
    ctx.restore();
    setIsLoading(false);
  }, [product]);

  const renderEarrings = (ctx, landmarks, img, width, height, yaw, roll) => {
    // Approximate ear positions (Face Mesh doesn't give exact earlobes, so we use cheek/jaw boundaries)
    // Left Ear Area: 234 (cheek), 93 (jaw)
    // Right Ear Area: 454 (cheek), 323 (jaw)
    
    const leftPoint = landmarks[132]; // Near left ear
    const rightPoint = landmarks[361]; // Near right ear
    
    const scaleFactor = getFaceScale(landmarks, width);
    const earringSize = 100 * scaleFactor; // Adjust base size as needed

    // Left Earring
    if (yaw > -0.2) { // Hide if looking too far right
      drawRotatedImage(
        ctx, 
        img, 
        leftPoint.x * width - earringSize / 2, 
        leftPoint.y * height, 
        earringSize, 
        earringSize, 
        roll
      );
    }

    // Right Earring
    if (yaw < 0.2) { // Hide if looking too far left
      drawRotatedImage(
        ctx, 
        img, 
        rightPoint.x * width - earringSize / 2, 
        rightPoint.y * height, 
        earringSize, 
        earringSize, 
        roll
      );
    }
  };

  const renderNecklace = (ctx, landmarks, img, width, height, yaw, roll) => {
    // Chin: 152
    const chin = landmarks[152];
    const leftShoulder = { x: chin.x - 0.2, y: chin.y + 0.3 }; // Approximate
    const rightShoulder = { x: chin.x + 0.2, y: chin.y + 0.3 }; // Approximate

    const scaleFactor = getFaceScale(landmarks, width);
    const necklaceWidth = 300 * scaleFactor;
    const necklaceHeight = necklaceWidth * (img.height / img.width);

    // Position below chin
    const x = chin.x * width - necklaceWidth / 2;
    const y = chin.y * height + (20 * scaleFactor); 

    drawRotatedImage(ctx, img, x, y, necklaceWidth, necklaceHeight, roll);
  };

  const getFaceScale = (landmarks, width) => {
    // Distance between cheekbones as scale reference
    const left = landmarks[234];
    const right = landmarks[454];
    const dx = (right.x - left.x) * width;
    const dy = (right.y - left.y) * width; // Assuming square pixels
    const distance = Math.sqrt(dx*dx + dy*dy);
    return distance / 200; // Normalize
  };

  const drawRotatedImage = (ctx, image, x, y, width, height, rotation) => {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation);
    // Draw image centered
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    
    // Apply mix-blend-mode to help with white backgrounds if needed
    // ctx.globalCompositeOperation = 'multiply'; 
    
    ctx.restore();
  };

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

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video) {
            await faceMesh.send({image: webcamRef.current.video});
          }
        },
        width: 640,
        height: 480
      });
      camera.start();
    }

    return () => {
      faceMesh.close();
    };
  }, [onResults]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
          <h2 className="text-white text-xl font-bold drop-shadow-md">Virtual Try-On</h2>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900 text-white">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p>Loading Face Mesh Model...</p>
            </div>
          </div>
        )}

        {/* Camera and Canvas */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
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
            className="w-full h-full object-contain transform -scale-x-100" // Mirror the canvas output
          />
          
          {cameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900">
              <p>Camera permission denied. Please allow camera access to use this feature.</p>
            </div>
          )}
        </div>

        {/* Footer/Instructions */}
        <div className="p-4 bg-gray-800 text-white text-center">
          <p className="text-sm opacity-80">
            {product.category === 'Earrings' ? 'Move your head to see earrings from different angles.' : 'Position your face in the center.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
