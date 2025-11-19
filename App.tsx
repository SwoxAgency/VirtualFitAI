import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, RotateCcw, Download, Share2, AlertCircle } from 'lucide-react';
import CameraFeed from "./CameraFeed";
import Wardrobe from "./Wardrobe";
import { Garment, AppState } from './types';
import { generateTryOnImage } from "./geminiService";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CAPTURE);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handleCapture = (imageData: string) => {
    setUserImage(imageData);
    setAppState(AppState.SELECT_GARMENT);
  };

  const handleSelectGarment = (garment: Garment) => {
    setSelectedGarment(garment);
  };

  const handleGenerate = async () => {
    if (!userImage || !selectedGarment) return;

    setAppState(AppState.PROCESSING);
    setIsThinking(true);
    setError(null);

    try {
      // Pass the category (e.g., 'top') to help the model understand what to replace
      const result = await generateTryOnImage(
        userImage, 
        selectedGarment.imageUrl, 
        selectedGarment.name,
        selectedGarment.category
      );
      setGeneratedImage(result);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      setError(err.message || "Failed to generate try-on. Please try again.");
      setAppState(AppState.SELECT_GARMENT);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReset = () => {
    setAppState(AppState.CAPTURE);
    setUserImage(null);
    setGeneratedImage(null);
    setError(null);
  };

  const handleBackToWardrobe = () => {
    setAppState(AppState.SELECT_GARMENT);
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `virtual-fit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              VirtualFit AI
            </h1>
            <p className="text-xs text-slate-500">Immersive Try-On Experience</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 text-sm text-slate-400">
            <span className={`px-3 py-1 rounded-full ${appState === AppState.CAPTURE ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : ''}`}>1. Capture</span>
            <span className={`px-3 py-1 rounded-full ${appState === AppState.SELECT_GARMENT ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : ''}`}>2. Select</span>
            <span className={`px-3 py-1 rounded-full ${appState === AppState.RESULT ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : ''}`}>3. View</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
            
            {/* Left Panel: Wardrobe */}
            <div className={`lg:col-span-4 h-full ${appState === AppState.CAPTURE ? 'opacity-50 pointer-events-none grayscale' : ''} transition-all duration-500`}>
               <Wardrobe 
                 onSelect={handleSelectGarment} 
                 selectedId={selectedGarment?.id} 
               />
            </div>

            {/* Center Panel: Main Stage */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full relative">
                
                {/* Error Message */}
                {error && (
                  <div className="absolute top-4 left-4 right-4 z-20 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto hover:bg-white/20 rounded p-1">
                        ✕
                    </button>
                  </div>
                )}

                {/* View State Switcher */}
                <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl">
                    
                    {appState === AppState.CAPTURE && (
                        <CameraFeed onCapture={handleCapture} />
                    )}

                    {(appState === AppState.SELECT_GARMENT || appState === AppState.PROCESSING) && userImage && (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                             <img src={userImage} alt="User" className="w-full h-full object-contain opacity-60" />
                             {selectedGarment && (
                                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                     <div className="text-center p-8 bg-slate-900/90 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full">
                                         <h3 className="text-xl font-bold mb-6">Ready to Try On?</h3>
                                         <div className="flex justify-center gap-4 mb-6">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-600">
                                                <img src={userImage} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex items-center text-purple-400">
                                                <Sparkles />
                                            </div>
                                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                                <img src={selectedGarment.imageUrl} className="w-full h-full object-cover" />
                                            </div>
                                         </div>
                                         
                                         {isThinking ? (
                                            <div className="flex flex-col items-center gap-3 py-4">
                                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-slate-300 animate-pulse font-mono text-sm">
                                                    Analysing Body Dimensions...<br/>
                                                    <span className="text-xs text-slate-500">High-Fidelity Rendering</span>
                                                </p>
                                            </div>
                                         ) : (
                                             <button 
                                                onClick={handleGenerate}
                                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
                                             >
                                                Generate Virtual Fit
                                             </button>
                                         )}
                                         <button onClick={() => setAppState(AppState.CAPTURE)} className="mt-4 text-slate-400 hover:text-white text-sm underline">
                                            Retake Photo
                                         </button>
                                     </div>
                                 </div>
                             )}
                             {!selectedGarment && (
                                 <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
                                     <p className="text-xl font-light text-white drop-shadow-lg bg-black/50 inline-block px-6 py-2 rounded-full backdrop-blur-sm">
                                        Select an item from your wardrobe on the left
                                     </p>
                                 </div>
                             )}
                        </div>
                    )}

                    {appState === AppState.RESULT && generatedImage && (
                        <div className="relative w-full h-full group">
                            <img src={generatedImage} alt="Result" className="w-full h-full object-contain bg-black" />
                            
                            {/* Result Actions */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-colors">
                                    <Download size={18} /> Save Look
                                </button>
                                <button onClick={handleBackToWardrobe} className="flex items-center gap-2 px-6 py-3 bg-slate-800/80 backdrop-blur text-white rounded-full hover:bg-slate-700 transition-colors">
                                    <RotateCcw size={18} /> Try Another Item
                                </button>
                            </div>
                            
                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-wider border border-white/20">
                                    AI Generated
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
