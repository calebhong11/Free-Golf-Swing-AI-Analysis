import { NextRequest, NextResponse } from 'next/server';
import { generateFeedback } from '@/lib/aiAnalyzer';

function generateMockMetrics() {
  return {
    hipRotation: 55,
    shoulderTurn: 105,
    headMovement: 2.1,
    spineAngle: 34,
    armExtension: 0.88,
    weightTransfer: 0.75,
  };
}

function generateMockScore() {
  return {
    overall: 7.2,
    setup: 7,
    backswing: 7.5,
    downswing: 7,
    impact: 7.2,
    followThrough: 7.5,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log('Analyzing swing for job:', jobId);

    const metrics = generateMockMetrics();
    const score = generateMockScore();

    const feedback = await generateFeedback(metrics, score);

    return NextResponse.json({
      jobId,
      status: 'completed',
      score: feedback.source === 'replicate' ? 7.5 : 7.2,
      setup: feedback.setup,
      backswing: feedback.backswing,
      downswing: feedback.downswing,
      followThrough: feedback.followThrough,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      drills: feedback.drills,
      metrics: {
        hipRotation: Math.round(metrics.hipRotation),
        shoulderTurn: Math.round(metrics.shoulderTurn),
        headMovement: Math.round(metrics.headMovement * 10) / 10,
      },
      aiSource: feedback.source,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}