import { NextRequest, NextResponse } from 'next/server';
import { generateFeedback } from '@/lib/aiAnalyzer'; // Make sure this path matches your folder structure!

export const maxDuration = 60; // Extends timeout for AI processing Vercel deployments
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 AI Analysis route called');
    
    const body = await request.json();
    
    // 1. Grab the metrics, scores, and the extracted base64 image frame from the frontend
    const { metrics, score, base64Image } = body;

    // Validation checks
    if (!metrics || !score) {
      console.error('❌ Metrics or score missing from request body');
      return NextResponse.json({ error: 'Metrics and score are required' }, { status: 400 });
    }

    if (!base64Image) {
      console.error('❌ Extracted frame image (base64Image) is missing');
      return NextResponse.json({ error: 'Base64 image frame is required for vision analysis' }, { status: 400 });
    }

    console.log('📦 Passing data to Llama 3.2 Vision Analyzer...');

    // 2. Call your newly updated traffic cop function with all 3 required arguments
    const analysisFeedback = await generateFeedback(metrics, score, base64Image);

    // 3. Return the clean JSON structure straight back to your frontend UI
    return NextResponse.json(analysisFeedback);

  } catch (error) {
    console.error('❌ AI analysis route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI analysis failed' },
      { status: 500 }
    );
  }
}