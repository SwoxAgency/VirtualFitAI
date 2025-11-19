import React, { useState } from 'react';
import { Upload, Shirt, Trash2 } from 'lucide-react';
import { Garment } from '../types';

interface WardrobeProps {
  onSelect: (garment: Garment) => void;
  selectedId?: string;
}

const Wardrobe: React.FC<WardrobeProps> = ({ onSelect, selectedId }) => {
  const [garments, setGarments] = useState<Garment[]>([
    {
        id: 'demo-1',
        name: 'Orange Wool Sweater',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
        category: 'top'
    },
    {
        id: 'demo-2',
        name: 'Denim Jacket',
        imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
        category: 'top'
    },
    {
        id: 'demo-3',
        name: 'Black Graphic Tee',
        imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
        category: 'top'
    }
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newGarment: Garment = {
          id: Date.now().toString(),
          name: file.name.split('.')[0],
          imageUrl: reader.result as string,
          category: 'top', // Default for simplicity
        };
        setGarments([newGarment, ...garments]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setGarments(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
        <Shirt className="text-purple-400" />
        My Wardrobe
      </h2>
      
      {/* Upload Area */}
      <div className="mb-6">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-purple-500 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <p className="text-sm text-slate-400"><span className="font-semibold">Click to upload</span> garment</p>
            <p className="text-xs text-slate-500">PNG, JPG (max 5MB)</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
        {garments.map((garment) => (
          <div 
            key={garment.id}
            onClick={() => onSelect(garment)}
            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedId === garment.id 
                ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : 'border-transparent hover:border-slate-600'
            }`}
          >
            <img 
              src={garment.imageUrl} 
              alt={garment.name}
              className="w-full h-40 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
              <p className="text-xs text-white truncate">{garment.name}</p>
            </div>
            {garment.id.startsWith('demo') ? null : (
                <button 
                    onClick={(e) => handleDelete(e, garment.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={12} />
                </button>
            )}
            {selectedId === garment.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full shadow-lg ring-2 ring-white" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wardrobe;