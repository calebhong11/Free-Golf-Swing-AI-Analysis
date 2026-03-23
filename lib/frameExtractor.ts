'use client';
export interface ExtractedFrame {
  dataUrl: string;
  timestamp: number;
  frameNumber: number;
  phase: string;
}

/**
 * Identify swing phase based on frame position in video
 */
export function identifySwingPhase(frameNumber: number, totalFrames: number): string {
  const position = frameNumber / totalFrames;
  if (position < 0.15) return 'Setup';
  if (position < 0.35) return 'Backswing';
  if (position < 0.45) return 'Top';
  if (position < 0.65) return 'Downswing';
  if (position < 0.75) return 'Impact';
  return 'Follow-through';
}

/**
 * Get tailwind color class for each phase
 */
export function getPhaseColor(phase: string): string {
  switch (phase) {
    case 'Setup': return 'bg-blue-500';
    case 'Backswing': return 'bg-purple-500';
    case 'Top': return 'bg-yellow-500';
    case 'Downswing': return 'bg-orange-500';
    case 'Impact': return 'bg-red-500';
    case 'Follow-through': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}

/**
 * Extract a single frame at a given timestamp
 */
function extractSingleFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  frameNumber: number,
  totalFrames: number
): Promise<ExtractedFrame | null> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve({
          dataUrl,
          timestamp,
          frameNumber,
          phase: identifySwingPhase(frameNumber, totalFrames),
        });
      } catch {
        resolve(null);
      }
    };

    video.onseeked = onSeeked;
    video.currentTime = timestamp;
  });
}

/**
 * Main extraction function - extracts frames one at a time
 * Calls onFrameExtracted after EACH frame so the UI can update live
 * 
 * @param videoFile - The uploaded video file
 * @param totalFrames - How many frames to extract (default 15)
 * @param onFrameExtracted - Callback fired after each frame is extracted
 * @returns Array of all extracted frames
 */
export async function extractFramesFromVideo(
  videoFile: File,
  totalFrames: number = 15,
  onFrameExtracted?: (frame: ExtractedFrame, index: number, total: number) => void
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.preload = 'auto';
    video.src = URL.createObjectURL(videoFile);

    video.onloadedmetadata = async () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const duration = video.duration;
      const interval = duration / (totalFrames + 1); // +1 to avoid grabbing very last frame
      const allFrames: ExtractedFrame[] = [];

      try {
        for (let i = 0; i < totalFrames; i++) {
          const timestamp = interval * (i + 1);
          const frame = await extractSingleFrame(video, canvas, ctx, timestamp, i, totalFrames);

          if (frame) {
            allFrames.push(frame);
            // Fire callback so UI updates immediately
            if (onFrameExtracted) {
              onFrameExtracted(frame, i, totalFrames);
            }
          }
        }

        URL.revokeObjectURL(video.src);
        resolve(allFrames);
      } catch (err) {
        URL.revokeObjectURL(video.src);
        // Return whatever frames we got so far - fail gracefully
        resolve(allFrames);
      }
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
}
