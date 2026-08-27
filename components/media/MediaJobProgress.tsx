'use client';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export function MediaJobProgress({ jobId, onComplete }: { jobId: string, onComplete?: () => void }) {
  const [status, setStatus] = useState<string>('QUEUED');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!jobId || status === 'COMPLETED' || status === 'FAILED') return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/media/jobs/${jobId}`);
      const data = await res.json();
      
      if (data.job) {
        setStatus(data.job.status);
        setProgress(data.job.progress);
        if (data.job.status === 'COMPLETED' && onComplete) {
          onComplete();
        }
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId, status]);

  if (status === 'COMPLETED') {
    return (
      <div className="flex items-center text-green-600 space-x-2">
        <CheckCircleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Ready</span>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="flex items-center text-red-600 space-x-2">
        <ExclamationCircleIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Generation failed</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center space-x-2 text-gray-600">
        <ArrowPathIcon className="w-4 h-4 animate-spin" />
        <span className="text-sm">Processing... {progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}