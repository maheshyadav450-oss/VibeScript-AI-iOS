import { GEMINI_API_KEY, GEMINI_MODEL } from './config';
import type { GenerationInput, ScriptBlueprint, HookMatrix, ViralScore } from './types';

/**
 * Google Gemini 1.5 Flash generation engine.
 * Calls the REST endpoint directly — no SDK needed for web.
 * Returns a structured viral video blueprint matching the strict JSON schema.
 */

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are VibeScript AI, an elite viral content strategist and scriptwriter.
You produce production-ready viral video blueprints. You ALWAYS respond with valid JSON only — no markdown, no code fences, no prose outside JSON.

The JSON shape must be EXACTLY this structure:
{
  "title": "Hyper-clickable title text",
  "hooks": {
    "fear_trap": "Hook line...",
    "curiosity_blindspot": "Hook line...",
    "ego_trigger": "Hook line...",
    "cheat_code": "Hook line...",
    "trend_ride": "Hook line"
  },
  "script_body": "[0:00-0:03] [SFX/Visual Direction] Script dialogue line...\\n[0:04-0:20] [SFX/Visual Direction] Next script line...",
  "metadata": {
    "caption": "Optimized description caption text",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
  },
  "viral_score": {
    "overall": 87,
    "hook_strength": 90,
    "trend_alignment": 85,
    "engagement_prediction": 82,
    "audience_fit": 88,
    "novelty": 79,
    "insights": ["Short actionable insight 1", "Short actionable insight 2", "Short actionable insight 3"]
  }
}

Rules:
- "hooks" must be an object with exactly those 5 keys, each a single punchy hook line.
- "script_body" must use [0:00-0:03] style timestamp ranges with [SFX/Visual Direction] cues, newline-separated.
- "metadata.hashtags" must include the # symbol, 5-8 tags.
- "metadata.keywords" must be 3-5 plain keywords without #.
- "viral_score" scores must be integers 0-100. "insights" must be 2-4 short actionable strings.
- Match the requested slang and tone precisely.
- Keep the script tailored to the platform's native length and format.`;

function buildPrompt(input: GenerationInput): string {
  return `Generate a viral video blueprint.
Topic: ${input.topic}
Platform: ${input.platform}
Slang style: ${input.slang}
Tone: ${input.tone}

Return ONLY the JSON object described in the system instruction.`;
}

interface GeminiResponse {
  title?: string;
  hooks?: Partial<HookMatrix>;
  script_body?: string;
  metadata?: {
    caption?: string;
    keywords?: string[];
    hashtags?: string[];
  };
  viral_score?: {
    overall?: number;
    hook_strength?: number;
    trend_alignment?: number;
    engagement_prediction?: number;
    audience_fit?: number;
    novelty?: number;
    insights?: string[];
  };
}

export async function generateBlueprint(input: GenerationInput): Promise<ScriptBlueprint> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured.');
  }

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPrompt(input) }],
      },
    ],
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Network error reaching Gemini. Check your connection.');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message ?? '';
    } catch {
      /* ignore */
    }
    throw new Error(`Gemini error (${res.status}). ${detail}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  let parsed: GeminiResponse;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini response was not valid JSON.');
    parsed = JSON.parse(match[0]);
  }

  const hooks: HookMatrix = {
    fear_trap: parsed.hooks?.fear_trap ?? '',
    curiosity_blindspot: parsed.hooks?.curiosity_blindspot ?? '',
    ego_trigger: parsed.hooks?.ego_trigger ?? '',
    cheat_code: parsed.hooks?.cheat_code ?? '',
    trend_ride: parsed.hooks?.trend_ride ?? '',
  };

  const hashtags: string[] = parsed.metadata?.hashtags ?? [];
  const keywords: string[] = parsed.metadata?.keywords ?? [];

  const viralScore: ViralScore | undefined = parsed.viral_score
    ? {
        overall: clampScore(parsed.viral_score.overall),
        hook_strength: clampScore(parsed.viral_score.hook_strength),
        trend_alignment: clampScore(parsed.viral_score.trend_alignment),
        engagement_prediction: clampScore(parsed.viral_score.engagement_prediction),
        audience_fit: clampScore(parsed.viral_score.audience_fit),
        novelty: clampScore(parsed.viral_score.novelty),
        insights: parsed.viral_score.insights ?? [],
      }
    : undefined;

  return {
    title: parsed.title ?? 'Untitled Blueprint',
    platform: input.platform,
    slang: input.slang,
    tone: input.tone,
    hooks,
    script_body: parsed.script_body ?? '',
    caption: parsed.metadata?.caption ?? '',
    keywords,
    hashtags,
    viral_score: viralScore,
  };
}

function clampScore(n: unknown): number {
  const num = typeof n === 'number' ? n : 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}
