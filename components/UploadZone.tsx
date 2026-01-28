'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 50MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload MP4, MOV, or WebM.');
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Additional validation: check duration (would need to load video)
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        
        if (video.duration < 3) {
          setError('Video is too short. Minimum duration is 3 seconds.');
          return;
        }
        
        if (video.duration > 60) {
          setError('Video is too long. Maximum duration is 60 seconds.');
          return;
        }
        
        // File is valid, proceed
        onFileSelect(file);
      };
      
      video.src = URL.createObjectURL(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/webm': ['.webm'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isDragActive ? (
            <>
              <Video className="w-16 h-16 text-green-500" />
              <p className="text-xl font-medium text-green-600 dark:text-green-400">
                Drop your video here
              </p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400" />
              <div>
                <p className="text-xl font-medium mb-2">
                  Drag and drop your golf swing video
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to browse files
                </p>
              </div>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>✓ Formats: MP4, MOV, WebM</p>
                <p>✓ Duration: 3-60 seconds</p>
                <p>✓ Max size: 50MB</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Video className="w-5 h-5" />
          Tips for best results:
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-7">
          <li>• Ensure your full body is visible in the frame</li>
          <li>• Record from the side (down-the-line view)</li>
          <li>• Use good lighting and a steady camera</li>
          <li>• Include the complete swing from setup to follow-through</li>
        </ul>
      </div>
    </div>
  );
}
