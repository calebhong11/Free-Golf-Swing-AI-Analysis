import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// This is a simplified version that just accepts the upload
// In production, you'd save to S3/cloud storage

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (video.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(video.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, MOV, or WebM' },
        { status: 400 }
      );
    }

    // Generate unique job ID
    const jobId = randomUUID();

    // TODO: In production, you would:
    // 1. Upload video to S3/cloud storage
    // 2. Store job metadata in database
    // 3. Trigger async processing job
    
    // For now, we'll just return a job ID
    console.log(`Received video upload: ${video.name} (${video.size} bytes)`);
    console.log(`Assigned job ID: ${jobId}`);

    return NextResponse.json({
      jobId,
      status: 'uploaded',
      fileName: video.name,
      fileSize: video.size,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
