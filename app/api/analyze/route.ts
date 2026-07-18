import { NextRequest, NextResponse } from 'next/server';
import { generateFeedback } from '@/lib/aiAnalyzer'; 

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 AI Analysis route called');
    
    // 1. Parse the incoming request
    const body = await request.json();
    
    // 2. Destructure exactly what the frontend sent (This fixes the 'base64Image' error)
    const { metrics, score, base64Image } = body;

    // 3. Validation checks
    if (!metrics || !score) {
      console.error('❌ Metrics or score missing from request body');
      return NextResponse.json({ error: 'Metrics and score are required' }, { status: 400 });
    }

    if (!base64Image) {
      console.error('❌ Extracted frame image (base64Image) is missing');
      return NextResponse.json({ error: 'Base64 image frame is required for vision analysis' }, { status: 400 });
    }

    console.log('📦 Passing data to AI Analyzer...');

    // 4. Call your AI function
    const analysisFeedback = await generateFeedback(metrics, score, base64Image);

    // 5. Return the result directly (This fixes all the 'feedback' errors!)
    return NextResponse.json(analysisFeedback);

  } catch (error) {
    console.error('❌ AI analysis route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI analysis failed' },
      { status: 500 }
    );
  }
}