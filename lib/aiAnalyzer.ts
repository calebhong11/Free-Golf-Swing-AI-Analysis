/**
 * AI Analyzer Module
 * 
 * Generates natural language feedback using LLM
 */

import { SwingMetrics } from './poseDetection';
import { ScoreBreakdown } from './swingScorer';

export interface AnalysisFeedback {
  strengths: string[];
  improvements: string[];
  drills: string[];
}

/**
 * Generate AI feedback using OpenAI
 * TODO: Add OpenAI integration
 */
export async function generateFeedback(
  metrics: SwingMetrics,
  score: ScoreBreakdown
): Promise<AnalysisFeedback> {
  // Placeholder implementation
  // In production, call OpenAI API with structured prompt
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not configured. Using mock feedback.');
    return generateMockFeedback(metrics, score);
  }
  
  try {
    // TODO: Implement OpenAI API call
    // const prompt = buildPrompt(metrics, score);
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: prompt }],
    // });
    
    // For now, return mock data
    return generateMockFeedback(metrics, score);
    
  } catch (error) {
    console.error('AI feedback generation failed:', error);
    return generateMockFeedback(metrics, score);
  }
}

/**
 * Build structured prompt for LLM
 */
function buildPrompt(metrics: SwingMetrics, score: ScoreBreakdown): string {
  return `You are a professional golf instructor analyzing a student's swing.

SWING METRICS:
- Hip Rotation: ${metrics.hipRotation}° (ideal: 45-60°)
- Shoulder Turn: ${metrics.shoulderTurn}° (ideal: 90-110°)
- Head Movement: ${metrics.headMovement}cm (ideal: <2cm)
- Spine Angle: ${metrics.spineAngle}° (ideal: 30-40°)
- Arm Extension: ${(metrics.armExtension * 100).toFixed(0)}% (ideal: >85%)
- Weight Transfer: ${(metrics.weightTransfer * 100).toFixed(0)}% (ideal: >70%)

SCORE BREAKDOWN:
- Overall: ${score.overall}/10
- Setup: ${score.setup}/10
- Backswing: ${score.backswing}/10
- Downswing: ${score.downswing}/10
- Impact: ${score.impact}/10
- Follow-through: ${score.followThrough}/10

Please provide:
1. 2-3 specific strengths in the swing
2. 2-3 areas for improvement with clear explanations
3. 1-2 actionable practice drills

Format your response as JSON:
{
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "drills": ["...", "..."]
}`;
}

/**
 * Generate mock feedback for development/testing
 */
function generateMockFeedback(
  metrics: SwingMetrics,
  score: ScoreBreakdown
): AnalysisFeedback {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const drills: string[] = [];
  
  // Analyze metrics and generate appropriate feedback
  
  if (metrics.hipRotation >= 45 && metrics.hipRotation <= 90) {
    strengths.push(
      `Excellent hip rotation (${metrics.hipRotation}°) during the backswing, generating good power potential`
    );
  } else if (metrics.hipRotation > 90) {
    improvements.push(
      `Hip rotation is excessive (${metrics.hipRotation}°). Try to limit hip turn to 45-60° to maintain stability`
    );
  }
  
  if (metrics.shoulderTurn >= 90 && metrics.shoulderTurn <= 110) {
    strengths.push(
      `Great shoulder turn (${metrics.shoulderTurn}°), creating excellent coil and torque`
    );
  } else if (metrics.shoulderTurn < 80) {
    improvements.push(
      `Shoulder turn is limited (${metrics.shoulderTurn}°). Work on increasing rotation to 90-110° for more power`
    );
    drills.push(
      `Wall drill: Practice turning your lead shoulder to touch a wall behind you to improve rotation`
    );
  }
  
  if (metrics.headMovement <= 2) {
    strengths.push(
      `Excellent head stability (${metrics.headMovement}cm movement), maintaining your spine angle through impact`
    );
  } else if (metrics.headMovement > 3) {
    improvements.push(
      `Head movement (${metrics.headMovement}cm) is affecting consistency. Focus on keeping your head steady through the swing`
    );
    drills.push(
      `Mirror drill: Practice swings while watching your head position in a mirror to build awareness`
    );
  }
  
  if (metrics.weightTransfer >= 0.7) {
    strengths.push(
      `Strong weight transfer (${(metrics.weightTransfer * 100).toFixed(0)}%), showing good athletic movement`
    );
  } else {
    improvements.push(
      `Weight transfer is limited (${(metrics.weightTransfer * 100).toFixed(0)}%). Work on shifting pressure from back foot to front foot during downswing`
    );
  }
  
  // Ensure we have at least 2 items in each category
  if (strengths.length < 2) {
    strengths.push(
      `Good overall swing foundation with a score of ${score.overall}/10`
    );
  }
  
  if (improvements.length < 2) {
    improvements.push(
      `Continue working on consistency and tempo to lower your scores`
    );
  }
  
  if (drills.length === 0) {
    drills.push(
      `Practice with alignment sticks to reinforce proper swing plane and body angles`
    );
  }
  
  return {
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    drills: drills.slice(0, 2)
  };
}
