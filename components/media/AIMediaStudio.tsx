'use client';
import { useState } from 'react';
import { SparklesIcon, ScissorsIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { MediaJobProgress } from './MediaJobProgress';

export function AIMediaStudio({ mediaAsset }: { mediaAsset: any }) {
  const [prompt, setPrompt] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleAction = async (actionType: string) => {
    const res = await fetch('/api/media/ai', {
      method: 'POST',
      body: JSON.stringify({
        mediaId: mediaAsset.id,
        inputVersionId: mediaAsset.currentVersionId,
        action: actionType,
        config: { prompt }
      })
    });
    
    const data = await res.json();
    if (data.success) {
      setActiveJobId(data.job.id);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <SparklesIcon className="w-6 h-6 text-indigo-600" />
        <h2 className="text-lg font-semibold">AI Media Studio</h2>
      </div>

      {!activeJobId ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleAction('REMOVE_BACKGROUND')}
              className="flex items-center p-3 border rounded hover:bg-gray-50 text-sm"
            >
              <ScissorsIcon className="w-4 h-4 mr-2" /> Remove Background
            </button>
            <button 
              onClick={() => handleAction('REPLACE_BACKGROUND')}
              className="flex items-center p-3 border rounded hover:bg-gray-50 text-sm"
            >
              <PhotoIcon className="w-4 h-4 mr-2" /> Replace Background
            </button>
          </div>

          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe changes (Prompt)
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="e.g. A luxury living room at sunset..."
            />
            <button 
              onClick={() => handleAction('GENERATE_IMAGE')}
              className="mt-3 w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700"
            >
              Generate
            </button>
          </div>
        </div>
      ) : (
        <div className="py-6">
          <MediaJobProgress 
            jobId={activeJobId} 
            onComplete={() => {
              // Refresh router or query cache to show new image version
              window.location.reload(); 
            }} 
          />
        </div>
      )}
    </div>
  );
}