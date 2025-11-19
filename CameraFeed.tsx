import React, { useEffect, useRef, useState } from 'react';
import { SwitchCamera } from 'lucide-react';

interface CameraFeedProps {
  onCapture: (imageData: string) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure permissions are granted.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip if using front camera for mirror effect
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group select-none">
      {error ? (
        <div className="flex items-center justify-center h-full text-red-400 p-4 text-center">
          {error}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* VR HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corners */}
            <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-purple-500/50 rounded-tl-lg opacity-70" />
            <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-purple-500/50 rounded-tr-lg opacity-70" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-purple-500/50 rounded-bl-lg opacity-70" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-purple-500/50 rounded-br-lg opacity-70" />
            
            {/* Center Target / Silhouette Guide */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border border-purple-500/20 rounded-[3rem]">
                <div className="absolute inset-0 bg-purple-500/5 animate-pulse rounded-[3rem]" />
                {/* Crosshair */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-purple-500/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-purple-500/30" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-4 bg-purple-500/30" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-4 bg-purple-500/30" />
            </div>

            {/* Status Text */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                <p className="text-[10px] font-mono text-purple-300 tracking-widest uppercase">
                    System Ready // Align Body
                </p>
            </div>

            {/* Scanning Line Animation */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-[scan_3s_ease-in-out_infinite]" />
          </div>
          
          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 pointer-events-auto z-10">
            <button 
                onClick={toggleCamera}
                className="p-3 bg-slate-800/60 backdrop-blur-md rounded-full text-white hover:bg-slate-700 transition-colors border border-white/10"
            >
                <SwitchCamera size={24} />
            </button>

            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/30 transition-all active:scale-95 active:border-purple-400 relative group"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-shadow" />
            </button>

            {/* Spacer to balance layout */}
            <div className="w-12" />
          </div>
        </>
      )}
      
      <style>{`
        @keyframes scan {
            0% { top: 10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CameraFeed;