'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExtractedFrame, getPhaseColor } from '../lib/frameExtractor';

interface ProgressIndicatorProps {
  status: string;
  progress: number;
  frames?: ExtractedFrame[];
  totalFrames?: number;
}

// Dynamic status messages based on progress
const getStatusMessage = (progress: number): string => {
  if (progress < 20) return 'Uploading your swing...';
  if (progress < 40) return 'Extracting video frames...';
  if (progress < 65) return 'Detecting body keypoints...';
  if (progress < 85) return 'Analyzing swing mechanics...';
  return 'Generating personalized feedback...';
};

export default function ProgressIndicator({ status, progress, frames = [], totalFrames = 15 }: ProgressIndicatorProps) {
  const [displayStatus, setDisplayStatus] = useState(status);

  useEffect(() => {
    setDisplayStatus(getStatusMessage(progress));
  }, [progress]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
        </div>

        {/* Status Text */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          {displayStatus}
        </h2>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                 style={{
                   backgroundSize: '200% 100%',
                   animation: 'shimmer 2s infinite'
                 }}
            />
          </div>
        </div>

        {/* Progress Percentage */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          {progress}% complete
        </p>

        {/* Live Frame Preview Strip */}
        {frames.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Extracting frames...
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {frames.length} of {totalFrames}
              </span>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {frames.map((frame, index) => {
                const isLatest = index === frames.length - 1;
                const phaseColor = getPhaseColor(frame.phase);

                return (
                  <div
                    key={index}
                    className={`
                      flex-shrink-0 relative rounded-lg overflow-hidden
                      transition-all duration-300 ease-out
                      ${isLatest ? 'ring-2 ring-green-500 scale-105' : 'ring-1 ring-gray-300 dark:ring-gray-600'}
                    `}
                    style={{ width: '80px', height: '60px', animation: 'fadeSlideIn 0.3s ease-out' }}
                  >
                    <img
                      src={frame.dataUrl}
                      alt={`Frame ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Phase dot */}
                    <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${phaseColor} border border-white`} />
                    {/* Frame number */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center" style={{ fontSize: '9px', padding: '1px 0' }}>
                      {index + 1}
                    </div>
                  </div>
                );
              })}

              {/* Placeholder dots for remaining frames */}
              {Array.from({ length: totalFrames - frames.length }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                  style={{ width: '80px', height: '60px' }}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Phase Legend */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {['Setup', 'Backswing', 'Top', 'Downswing', 'Impact', 'Follow-through'].map((phase) => (
                <div key={phase} className="flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${getPhaseColor(phase)}`} />
                  <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>{phase}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Steps */}
        <div className="space-y-3">
          <ProcessingStep
            label="Uploading video"
            completed={progress >= 20}
            active={progress < 20}
          />
          <ProcessingStep
            label={frames.length > 0 ? `Extracting frames (${frames.length}/${totalFrames})` : 'Extracting frames'}
            completed={progress >= 40}
            active={progress >= 20 && progress < 40}
          />
          <ProcessingStep
            label="Detecting pose keypoints"
            completed={progress >= 65}
            active={progress >= 40 && progress < 65}
          />
          <ProcessingStep
            label="Analyzing swing mechanics"
            completed={progress >= 85}
            active={progress >= 65 && progress < 85}
          />
          <ProcessingStep
            label="Generating feedback"
            completed={progress >= 100}
            active={progress >= 85 && progress < 100}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
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
        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
        ${completed ? 'bg-green-500 scale-110' : active ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}
      `}>
        {completed && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {active && !completed && (
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
        )}
      </div>
      <span className={`text-sm transition-all duration-300 ${completed || active ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
