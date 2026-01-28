'use client';

import { CheckCircle2, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react';

interface AnalysisResultsProps {
  results: {
    score: number;
    strengths: string[];
    improvements: string[];
    metrics?: {
      hipRotation?: number;
      shoulderTurn?: number;
      headMovement?: number;
    };
  };
  onAnalyzeAnother: () => void;
}

export default function AnalysisResults({ results, onAnalyzeAnother }: AnalysisResultsProps) {
  const { score, strengths, improvements, metrics } = results;

  // Determine score color
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
      {/* Score Display */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">Your Swing Score</h2>
        
        {/* Circular Score */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${(score / 10) * 553} 553`}
              className={getScoreRing(score)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(1)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">out of 10</span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          {score >= 9 && "You have a tour level swing."}
          {score >= 8 && score < 9 && "Excellent swing! You almost have a tour level swing."}
          {score >= 6 && score < 8 && "Good swing with room for improvement."}
          {score >= 4 && score < 6 && "Decent swing, but let's work on a few things."}
          {score < 4 && "There's opportunity to improve your technique."}
        </p>
      </div>

      {/* Metrics (if available) */}
      {metrics && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Metrics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {metrics.hipRotation && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.hipRotation}°
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hip Rotation</p>
              </div>
            )}
            {metrics.shoulderTurn && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.shoulderTurn}°
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Shoulder Turn</p>
              </div>
            )}
            {metrics.headMovement && (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {metrics.headMovement}cm
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Head Movement</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strengths */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          What You Are Doing Well
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
          <AlertTriangle className="w-5 h-5" />
          Areas to Improve
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

      {/* Action Button */}
      <div className="text-center pt-4">
        <button
          onClick={onAnalyzeAnother}
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <RotateCcw className="w-5 h-5" />
          Analyze Another Swing
        </button>
      </div>
    </div>
  );
}
