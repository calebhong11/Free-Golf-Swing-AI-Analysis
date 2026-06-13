import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('AI Analysis route called');
    
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    
    console.log('Body received:', JSON.stringify(body).substring(0, 100)); // Log first 100 chars
    console.log('Prompt exists:', !!body.prompt);
    
    const { prompt } = body;

    if (!prompt) {
      console.error('Prompt is missing from body');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // ... rest of code

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN not configured' },
        { status: 500 }
      );
    }

    console.log('Calling Replicate API...');

    // Call Replicate API
    const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/ai-analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0',
        input: {
          prompt: prompt,
          max_tokens: 1000,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Replicate error:', data);
      throw new Error(`Replicate error: ${data.detail || response.statusText}`);
    }

    console.log('Prediction created:', data.id);

    // Poll for completion
    let prediction = data;
    let pollCount = 0;
    const maxPolls = 120;

    while ((prediction.status === 'processing' || prediction.status === 'starting') && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: { 'Authorization': `Token ${token}` },
        }
      );

      prediction = await pollResponse.json();
      pollCount++;
      console.log(`Poll ${pollCount}: ${prediction.status}`);
    }

    if (prediction.status !== 'succeeded') {
      console.error('Prediction failed:', prediction);
      throw new Error(`Prediction failed with status: ${prediction.status}`);
    }

    const output = Array.isArray(prediction.output) 
      ? prediction.output.join('')
      : prediction.output;

    console.log('Raw output:', output);

    const jsonMatch = output.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('No JSON found in output:', output);
      throw new Error('Could not parse JSON from LLM response');
    }

    const feedback = JSON.parse(jsonMatch[0]);

    console.log('Parsed feedback:', feedback);

    return NextResponse.json({
      setup: feedback.setup || '',
      backswing: feedback.backswing || '',
      downswing: feedback.downswing || '',
      followThrough: feedback.followThrough || '',
      strengths: feedback.strengths || [],
      improvements: feedback.improvements || [],
      drills: feedback.drills || [],
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI analysis failed' },
      { status: 500 }
    );
  }
}