'use client';

import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  status: string;
  progress: number;
}

export default function ProgressIndicator({ status, progress }: ProgressIndicatorProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
        </div>

        {/* Status Text */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          {status}
        </h2>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {progress}% complete
        </p>

        {/* Processing Steps */}
        <div className="mt-8 space-y-3">
          <ProcessingStep 
            label="Uploading video" 
            completed={progress > 10} 
            active={progress <= 30}
          />
          <ProcessingStep 
            label="Extracting frames" 
            completed={progress > 30} 
            active={progress > 30 && progress <= 50}
          />
          <ProcessingStep 
            label="Detecting pose keypoints" 
            completed={progress > 50} 
            active={progress > 50 && progress <= 70}
          />
          <ProcessingStep 
            label="Analyzing swing mechanics" 
            completed={progress > 70} 
            active={progress > 70 && progress <= 90}
          />
          <ProcessingStep 
            label="Generating feedback" 
            completed={progress > 90} 
            active={progress > 90}
          />
        </div>
      </div>
    </div>
  );
}

function ProcessingStep({ 
  label, 
  completed, 
  active 
}: { 
  label: string; 
  completed: boolean; 
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
        ${completed ? 'bg-green-500' : active ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}
      `}>
        {completed && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {active && !completed && (
          <div className="w-2 h-2 bg-white rounded-full" />
        )}
      </div>
      <span className={`text-sm ${completed || active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
