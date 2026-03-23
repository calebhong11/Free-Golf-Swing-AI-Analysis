'use client';

import { useState, useEffect, useRef } from 'react';
import UploadZone from '@/components/UploadZone';
import ProgressIndicator from '@/components/ProgressIndicator';
import AnalysisResults from '@/components/AnalysisResults';
import { extractFramesFromVideo, ExtractedFrame } from '@/lib/frameExtractor';

type AnalysisState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

const TOTAL_FRAMES = 15;

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [progress, setProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth progress animation
  useEffect(() => {
    if (progress < targetProgress) {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const diff = targetProgress - prev;
          const increment = Math.max(0.5, Math.ceil(diff / 20));
          const newProgress = Math.min(prev + increment, targetProgress);

          if (newProgress >= targetProgress) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
          }

          return newProgress;
        });
      }, 50);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [targetProgress, progress]);

  const handleFileUpload = async (file: File) => {
    try {
      setAnalysisState('uploading');
      setProgress(0);
      setTargetProgress(0);
      setExtractedFrames([]);
      setError(null);

      const formData = new FormData();
      formData.append('video', file);

      // Stage 1: Uploading (0-20%)
      setTargetProgress(20);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const { jobId } = await uploadResponse.json();

      // Stage 2: Extract frames LIVE (20-40%)
      // Progress updates in real time as each frame extracts
      setAnalysisState('processing');
      setTargetProgress(20); // Hold here while extracting

      try {
        await extractFramesFromVideo(file, TOTAL_FRAMES, (frame, index, total) => {
          // This fires after EACH frame is extracted
          setExtractedFrames(prev => [...prev, frame]);

          // Update progress: each frame = ~1.33% (20% range / 15 frames)
          const frameProgress = 20 + ((index + 1) / total) * 20;
          setTargetProgress(Math.round(frameProgress));
        });
      } catch {
        // Frame extraction failed - continue without frames
        console.log('Frame extraction failed, continuing without frames');
      }

      // Make sure we hit 40% after extraction
      setTargetProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 3: Detecting keypoints (40-65%)
      setTargetProgress(65);
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Stage 4: Analyzing mechanics (65-85%)
      setTargetProgress(85);

      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await analysisResponse.json();

      // Stage 5: Generating feedback (85-100%)
      setTargetProgress(100);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Pass frames into results so AnalysisResults can display them
      setResults({
        ...analysisData,
        frames: extractedFrames,
      });
      setAnalysisState('completed');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalysisState('error');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const handleReset = () => {
    setAnalysisState('idle');
    setProgress(0);
    setTargetProgress(0);
    setResults(null);
    setError(null);
    setExtractedFrames([]);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            AI Golf Swing Analyzer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Upload your swing video and get instant AI-powered feedback
          </p>
        </div>

        {/* Main Content */}
        {analysisState === 'idle' && (
          <UploadZone onFileSelect={handleFileUpload} />
        )}

        {(analysisState === 'uploading' || analysisState === 'processing') && (
          <ProgressIndicator
            status={analysisState === 'uploading' ? 'Uploading video...' : 'Analyzing your swing...'}
            progress={progress}
            frames={extractedFrames}
            totalFrames={TOTAL_FRAMES}
          />
        )}

        {analysisState === 'completed' && results && (
          <AnalysisResults
            results={results}
            onAnalyzeAnother={handleReset}
          />
        )}

        {analysisState === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Features Section */}
        {analysisState === 'idle' && (
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Accurate Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered pose detection analyzes every frame
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Fast Results</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get your personalized feedback in under 60 seconds
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Detailed Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Strengths, improvements, and actionable tips
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
