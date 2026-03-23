'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, RotateCcw, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { ExtractedFrame, getPhaseColor } from '../lib/frameExtractor';

interface AnalysisResultsProps {
  results: {
    score: number;
    strengths: string[];
    improvements: string[];
    frames?: ExtractedFrame[];
    metrics?: {
      hipRotation?: number;
      shoulderTurn?: number;
      headMovement?: number;
    };
  };
  onAnalyzeAnother: () => void;
}

// ─── Inline FrameViewer (avoids module resolution issues) ────────────────────
function FrameViewer({ frames }: { frames: ExtractedFrame[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useState<ReturnType<typeof setInterval> | null>(null);

  if (!frames || frames.length === 0) return null;

  const current = frames[currentIndex];

  const startPlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= frames.length) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, 500);
    playRef[1](interval as any);
  };

  const stopPlay = () => {
    setIsPlaying(false);
    if (playRef[0]) clearInterval(playRef[0] as any);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Frame-by-Frame Playback</h3>

      {/* Phase badge */}
      <div className="flex justify-center mb-4">
        <span className={`px-4 py-1 rounded-full text-white text-sm font-medium ${getPhaseColor(current.phase)}`}>
          {current.phase}
        </span>
      </div>

      {/* Main frame */}
      <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-4">
        <img
          src={current.dataUrl}
          alt={`Frame ${currentIndex + 1}`}
          className="w-full object-contain"
          style={{ maxHeight: '400px' }}
        />
        <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {frames.length}
        </div>
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {current.timestamp.toFixed(2)}s
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={isPlaying ? stopPlay : startPlay}
          className="p-3 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setCurrentIndex((p) => Math.min(frames.length - 1, p + 1))}
          disabled={currentIndex === frames.length - 1}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 disabled:opacity-40 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {frames.map((frame, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`
                flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all
                ${index === currentIndex
                  ? 'border-green-500 ring-2 ring-green-400 scale-105'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                }
              `}
              style={{ width: '72px', height: '54px' }}
            >
              <img src={frame.dataUrl} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
              <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${getPhaseColor(frame.phase)} border border-white`} />
            </button>
          ))}
        </div>
      </div>

      {/* Phase legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {['Setup', 'Backswing', 'Top', 'Downswing', 'Impact', 'Follow-through'].map((phase) => (
          <div key={phase} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${getPhaseColor(phase)}`} />
            <span className="text-gray-500 dark:text-gray-400" style={{ fontSize: '11px' }}>{phase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main AnalysisResults Component ──────────────────────────────────────────
export default function AnalysisResults({ results, onAnalyzeAnother }: AnalysisResultsProps) {
  const { score, strengths, improvements, metrics, frames } = results;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-blue-600 dark:text-blue-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreRing = (score: number) => {
    if (score >= 8) return 'stroke-green-600 dark:stroke-green-400';
    if (score >= 6) return 'stroke-blue-600 dark:stroke-blue-400';
    if (score >= 4) return 'stroke-yellow-600 dark:stroke-yellow-400';
    return 'stroke-red-600 dark:stroke-red-400';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">Your Swing Score</h2>
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-gray-700" />
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
              strokeDasharray={`${(score / 10) * 553} 553`} className={getScoreRing(score)} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">out of 10</span>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {score >= 8 && 'Excellent swing! You are hitting it well.'}
          {score >= 6 && score < 8 && 'Good swing with room for improvement.'}
          {score >= 4 && score < 6 && 'Decent swing, but lets work on a few things.'}
          {score < 4 && 'There is opportunity to improve your technique.'}
        </p>
      </div>

      {/* Frame Viewer - uses already extracted frames */}
      {frames && frames.length > 0 && <FrameViewer frames={frames} />}

      {/* Metrics */}
      {metrics && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Key Metrics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {metrics.hipRotation && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.hipRotation}°</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hip Rotation</p>
              </div>
            )}
            {metrics.shoulderTurn && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.shoulderTurn}°</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Shoulder Turn</p>
              </div>
            )}
            {metrics.headMovement && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.headMovement}cm</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Head Movement</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strengths */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-5 h-5" /> What You Are Doing Well
        </h3>
        <ul className="space-y-3">
          {strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
          <AlertTriangle className="w-5 h-5" /> Areas to Improve
        </h3>
        <ul className="space-y-3">
          {improvements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Analyze Again */}
      <div className="text-center pt-4">
        <button
          onClick={onAnalyzeAnother}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <RotateCcw className="w-5 h-5" /> Analyze Another Swing
        </button>
      </div>
    </div>
  );
}
