import React, { useState } from 'react';

export default function IntakeForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [brandColor, setBrandColor] = useState('#3b82f6'); // Default blue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ businessName, description, tone, brandColor });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        Describe Your Business
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Business Name</label>
          <input 
            type="text" 
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g. FitLife Gym"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">What does your business do?</label>
          <textarea 
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            placeholder="We are a modern fitness center focusing on high-intensity training..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Brand Tone</label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Professional</option>
              <option>Playful & Fun</option>
              <option>Modern & Edgy</option>
              <option>Calm & Relaxing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Main Brand Color</label>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1">
              <input 
                type="color" 
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <span className="text-slate-300 font-mono text-sm">{brandColor}</span>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex justify-center items-center gap-2"
        >
          Start Building Website
        </button>
      </form>
    </div>
  );
}
