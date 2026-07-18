import { SwingMetrics } from './poseDetection';
import { ScoreBreakdown } from './swingScorer';

export interface AnalysisFeedback {
  setup: string;
  backswing: string;
  downswing: string;
  followThrough: string;
  strengths: string[];
  improvements: string[];
  drills: string[];
  source: 'replicate' | 'mock';
}

// 1. The "Traffic Cop" function that your API route calls
export async function generateFeedback(
  metrics: SwingMetrics,
  score: ScoreBreakdown,
  base64ImageString: string, // 1. ADD IT HERE
  retries = 1
): Promise<AnalysisFeedback> {
  console.log('🔍 generateFeedback called');
  
  const token = process.env.REPLICATE_API_TOKEN;
  
  if (!token) {
    return generateMockFeedback(metrics, score);
  }

  try {
    console.log(`🔍 Attempting Replicate... (Retries left: ${retries})`);
    
    // 2. FIX YOUR ERROR: Pass it into the actual Replicate caller here!
    return await generateReplicateFeedback(metrics, score, base64ImageString);
    
  } catch (error) {
    console.log('🔍 Replicate failed:', error);
    
    if (retries > 0) {
      console.log('🔄 Retrying Replicate request...');
      
      // 3. Make sure the retry loop also passes it back in
      return generateFeedback(metrics, score, base64ImageString, retries - 1);
    }
    
    return generateMockFeedback(metrics, score);
  }
}

// 2. The Prompt Builder
function buildPrompt(metrics: SwingMetrics, score: ScoreBreakdown): string {
  return `You are an elite golf instructor analyzing a golfer's swing in detail. Provide VERY COMPREHENSIVE, INSIGHTFUL feedback.

DETECTED SWING METRICS:
- Hip Rotation: ${metrics.hipRotation}° (ideal: 45-60°)
- Shoulder Turn: ${metrics.shoulderTurn}° (ideal: 90-110°)
- Head Movement: ${metrics.headMovement}cm (ideal: <2cm)
- Spine Angle: ${metrics.spineAngle}° (ideal: 30-40°)
- Arm Extension: ${(metrics.armExtension * 100).toFixed(0)}% (ideal: >85%)
- Weight Transfer: ${(metrics.weightTransfer * 100).toFixed(0)}% (ideal: >70%)

SWING PHASE SCORES:
- Overall: ${score.overall}/10
- Setup: ${score.setup}/10
- Backswing: ${score.backswing}/10
- Downswing: ${score.downswing}/10
- Impact: ${score.impact}/10
- Follow-through: ${score.followThrough}/10

PROVIDE DETAILED ANALYSIS (3-4 sentences per section, not bullet points):

1. **Setup and Alignment** - Discuss posture, stance, spine angle, alignment. Explain WHY proper setup matters for the entire swing.

2. **The Backswing** - Analyze rotation quality, club plane, wrist position. Explain what the metrics reveal and what it enables.

3. **Downswing and Impact** - Discuss weight transfer, sequencing, hand position at impact. Explain why this matters for ball striking.

4. **Follow-Through and Finish** - Describe balance, weight distribution, control. What does the finish position reveal?

5. **Key Strengths** (3 specific observations with metric details)
   - What the golfer does exceptionally well
   - Why it's valuable
   - Reference actual values

6. **Areas for Improvement** (3 specific areas with explanations)
   - What could be refined
   - Why it matters
   - How it affects ball striking

7. **One Actionable Drill** - Specific, detailed exercise to address the main weakness.

Use vivid, technical language. Reference specific metric values. Write like you're a pro coach explaining to a serious student.

Respond ONLY in JSON:
{
  "setup": "3-4 sentence detailed paragraph...",
  "backswing": "3-4 sentence detailed paragraph...",
  "downswing": "3-4 sentence detailed paragraph...",
  "followThrough": "3-4 sentence detailed paragraph...",
  "strengths": ["Long detailed strength 1...", "Long detailed strength 2...", "Long detailed strength 3..."],
  "improvements": ["Long detailed improvement 1...", "Long detailed improvement 2...", "Long detailed improvement 3..."],
  "drills": ["Detailed drill description..."]
}`;
}

// 3. The actual Replicate API caller (with the Bearer token fix)
async function generateReplicateFeedback(
  metrics: SwingMetrics,
  score: ScoreBreakdown,
  base64ImageString: string // <--- ADD THIS LINE HERE
): Promise<AnalysisFeedback> {
  // 1. Force the model to output JSON by injecting a strict rule at the end of your prompt
  const prompt = buildPrompt(metrics, score) + 
    "\n\nCRITICAL INSTRUCTION: YOU MUST RESPOND ONLY WITH VALID JSON. ABSOLUTELY NO DOUBLE QUOTES ARE ALLOWED INSIDE YOUR PARAGRAPHS. You may only use double quotes for JSON keys and to open/close strings. If you need to quote a word, use single quotes ('like this'). Do not include any conversational text. Start your response immediately with { and end it with }.";
  
  const rawToken = process.env.REPLICATE_API_TOKEN;
  if (!rawToken) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const token = rawToken.trim().replace(/['"]+/g, '');

  console.log('Calling Replicate directly...');

 const response = await fetch('https://api.replicate.com/v1/models/meta/llama-3.2-11b-vision-instruct/predictions', {    
    method: 'POST',
    cache: 'no-store', 
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        // THE NEW PART: Pass your extracted frame here as a Base64 data URI
        image: base64ImageString, 
        prompt: prompt,
        max_tokens: 2500,
        temperature: 0.2, 
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Replicate error:', data);
    throw new Error(`Replicate error: ${data.detail || response.statusText}`);
  }

  console.log('Prediction created:', data.id);

  let prediction = data;
  let pollCount = 0;
  const maxPolls = 180;

  while ((prediction.status === 'processing' || prediction.status === 'starting') && pollCount < maxPolls) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pollResponse = await fetch(
      prediction.urls.get, 
      {
        cache: 'no-store', 
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    prediction = await pollResponse.json();
    pollCount++;
    console.log(`Poll ${pollCount}: ${prediction.status}`);
  }

  if (prediction.status !== 'succeeded') {
    console.error('Prediction failed:', prediction);
    throw new Error(`Prediction failed: ${prediction.status}`);
  }

  const output = Array.isArray(prediction.output) 
    ? prediction.output.join('')
    : prediction.output;

  console.log('Raw LLM output length:', output.length);

  // 2. Use Regex to extract only the JSON object, ignoring any conversational filler
  const jsonMatch = output.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  
  if (!jsonMatch) {
    console.error('LLM failed to generate JSON. Output preview:', output.substring(0, 500));
    throw new Error('Could not find JSON in LLM output');
  }

  let jsonStr = jsonMatch[0];
  
  // 1. Clean up trailing commas (a very common LLM hallucination in JSON)
  jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
  
  // 2. THE FIX: Replace ALL control characters (including newlines and tabs) with a standard space
  jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
  
  try {
    const feedback = JSON.parse(jsonStr);
    console.log('✅ Successfully parsed JSON from Replicate');
    
    // Helper function to safely convert LLM objects into simple strings for React
    const safeStringArray = (data: any): string[] => {
      if (!data) return [];
      const arr = Array.isArray(data) ? data : [data];
      
      return arr.map(item => {
        if (typeof item === 'string') return item;
        
        // If the LLM returned an object like { metric, value, description }, grab the useful text
        if (typeof item === 'object' && item !== null) {
          // Fallback through common keys the LLM might use
          return item.description || item.text || item.metric || JSON.stringify(item);
        }
        
        return String(item);
      });
    };
    
    return {
      setup: feedback.setup || '',
      backswing: feedback.backswing || '',
      downswing: feedback.downswing || '',
      followThrough: feedback.followThrough || '',
      strengths: safeStringArray(feedback.strengths),
      improvements: safeStringArray(feedback.improvements),
      drills: safeStringArray(feedback.drills || feedback.drill),
      source: 'replicate'
    };
  } catch (parseError) {
    console.error('❌ JSON parse failed:', parseError);
    console.error('Position of error: ~390');
    console.error('JSON snippet around position 390:');
    console.error(jsonStr.substring(380, 410));
    console.error('Full JSON (first 500 chars):');
    console.error(jsonStr.substring(0, 500));
    throw new Error('Could not parse LLM response as JSON');
  }
}

// 4. The Fallback Mock Data
function generateMockFeedback(
  metrics: SwingMetrics,
  score: ScoreBreakdown
): AnalysisFeedback {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const drills: string[] = [];

  if (metrics.hipRotation >= 45 && metrics.hipRotation <= 60) {
    strengths.push(
      `Your hip rotation of ${metrics.hipRotation.toFixed(1)}° demonstrates excellent lower body engagement and is right in the ideal range for optimal power generation. This rotational movement is the foundation of your swing's power, as it creates the coil that stores energy during the backswing. The fact that you're achieving this rotation consistently shows that you have good flexibility and understanding of the golf swing sequence. This is one of the most important elements that separates consistent ball-strikers from high-handicappers.`
    );
  } else if (metrics.hipRotation > 60) {
    improvements.push(
      `Your hip rotation of ${metrics.hipRotation.toFixed(1)}° is excessive compared to the ideal 45-60° range. While it might feel like you're generating power, over-rotation actually causes instability and inconsistency in your swing. When your hips rotate too much, you lose the separation between your hip and shoulder rotation, which is crucial for maintaining control and striking the ball consistently. This over-rotation often leads to early extension and loss of posture through impact. You need to work on maintaining a more stable lower body while still achieving full rotation.`
    );
    drills.push(
      `Hip Restriction Drill: Use a belt or resistance band around your hips and practice backswings, focusing on limiting hip rotation to approximately 60° while maintaining full shoulder turn of 90-110°. This creates the hip-shoulder separation that's essential for consistent ball-striking. The belt acts as external feedback to help you feel the correct amount of rotation. Practice this drill 10 times daily for 2 weeks to retrain your muscle memory.`
    );
  }

  if (metrics.shoulderTurn >= 90 && metrics.shoulderTurn <= 110) {
    strengths.push(
      `Your shoulder turn of ${metrics.shoulderTurn.toFixed(1)}° is excellent and demonstrates strong rotational capability. Combined with your hip rotation, this creates the coil and torque differential that's fundamental to generating power. A full shoulder turn allows you to store maximum energy during the backswing, which you then unleash during the downswing. This metric shows that you have good flexibility and understand the importance of full rotation in the golf swing.`
    );
  }

  if (metrics.headMovement <= 2) {
    strengths.push(
      `Your head stability is exceptional at only ${metrics.headMovement.toFixed(1)}cm of movement throughout the swing. Keeping your head quiet through impact is absolutely critical for consistency, as any head movement causes your spine angle to change, which directly affects where the club contacts the ball. Elite players maintain head stability to ensure they strike the ball from the same position every time. This is one of your strongest technical attributes.`
    );
  } else if (metrics.headMovement > 2 && metrics.headMovement <= 3) {
    improvements.push(
      `Your head movement of ${metrics.headMovement.toFixed(1)}cm is slightly elevated compared to the ideal under 2cm. While this isn't severe, even small amounts of head movement can affect consistency and ball-striking quality. When your head moves laterally or vertically during the swing, your spine angle changes, which changes where the club meets the ball. This is why tour players work so hard on maintaining head stability. You should practice drills that build awareness of your head position.`
    );
  }

  if (metrics.weightTransfer >= 0.7) {
    strengths.push(
      `Your weight transfer of ${(metrics.weightTransfer * 100).toFixed(0)}% demonstrates excellent sequencing and athletic movement through the swing. Proper weight transfer from your back foot to your front foot during the downswing is essential for generating power and maintaining balance. The fact that you're achieving this level of weight shift shows you understand the importance of ground-up sequencing. This is a hallmark of efficient, powerful swings.`
    );
  }

  const setupFeedback = `Your setup shows a spine angle of ${metrics.spineAngle.toFixed(1)}°, which ${metrics.spineAngle >= 30 && metrics.spineAngle <= 40 ? 'is ideal and indicates excellent posture.' : 'needs adjustment—aim for 30-40°.'}  Proper setup is the foundation of everything that follows. Your posture, stance width, and alignment here will determine whether the rest of your swing can be efficient and repeatable. A neutral spine angle like yours sets you up to maintain your posture through impact, which is critical for consistent ball-striking.`;

  const backswingFeedback = `Your backswing rotation is ${metrics.hipRotation > 40 ? 'strong, with excellent coil.' : 'lacking depth.'} The ${metrics.hipRotation.toFixed(1)}° of hip rotation combined with your ${metrics.shoulderTurn.toFixed(1)}° shoulder turn creates ${metrics.hipRotation > 40 ? 'the separation needed for power generation. You\'re storing energy efficiently during the backswing, which allows you to unleash it powerfully in the downswing. This sequence shows good understanding of swing mechanics.' : 'some concerns. Focus on full rotation to build the coil that powers the downswing.'}`;

  const downswingFeedback = `Your downswing transition shows ${metrics.weightTransfer > 0.6 ? 'excellent sequencing' : 'areas needing work'} with weight transfer of ${(metrics.weightTransfer * 100).toFixed(0)}%. ${metrics.weightTransfer > 0.6 ? 'You\'re shifting to your lead side effectively, which creates stability and leverage for powerful ball-striking. This ground-up sequencing is what separates good golfers from great ones.' : 'You\'re not fully shifting to your lead side, which costs you distance and consistency. Practice shifting weight earlier in the downswing.'}`;

  const followThroughFeedback = `Your finish position shows ${score.followThrough >= 6 ? 'excellent balance and control' : 'some balance issues'}. ${score.followThrough >= 6 ? 'You\'re completing the swing fully and ending in a stable, athletic position, which indicates you\'re maintaining control throughout the swing.' : 'Focus on holding a stable finish position—the follow-through reveals whether you maintained control throughout the swing.'}`;

  return {
    setup: setupFeedback,
    backswing: backswingFeedback,
    downswing: downswingFeedback,
    followThrough: followThroughFeedback,
    strengths: strengths.length > 0 ? strengths : ["You're showing solid fundamentals."],
    improvements: improvements.length > 0 ? improvements : ["Continue working on consistency and tempo."],
    drills: drills.length > 0 ? drills : ["Mirror drill: Practice slow-motion swings while watching your head position for 10 minutes daily."],
    source: 'mock'
  };
}