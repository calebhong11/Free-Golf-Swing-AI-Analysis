'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ProgressIndicator from '@/components/ProgressIndicator';
import AnalysisResults from '@/components/AnalysisResults';

type AnalysisState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setAnalysisState('uploading');
      setProgress(10);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('video', file);

      // Upload video
      setProgress(30);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const { jobId } = await uploadResponse.json();
      
      // Start analysis
      setAnalysisState('processing');
      setProgress(50);

      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await analysisResponse.json();
      
      setProgress(100);
      setResults(analysisData);
      setAnalysisState('completed');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalysisState('error');
    }
  };

  const handleReset = () => {
    setAnalysisState('idle');
    setProgress(0);
    setResults(null);
    setError(null);
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
