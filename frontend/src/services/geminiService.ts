/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Gemini AI Service — Incident Classification
 * ============================================================
 *
 * Uses Google Gemini to analyze citizen-reported incidents and:
 * - Classify the incident category
 * - Determine urgency level
 * - Generate a brief summary
 * - Suggest relevant authorities to route to
 *
 * NOTE: The AI analysis is a UX enhancement only.
 * The actual report is secured and stored by the backend.
 */

import { GoogleGenAI, Type } from '@google/genai';

// Vite exposes env vars via import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export interface IncidentAnalysis {
  category: string;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  summary: string;
  authorities: string[];
}

// Detailed classification prompt for accurate incident analysis
const ANALYSIS_PROMPT = `You are JAAGRUK AI, an expert incident classifier for India's civic reporting platform.

CLASSIFICATION GUIDELINES:

**CATEGORIES** (choose ONE most accurate):
1. **Crime / Safety** - Theft, robbery, assault, harassment, domestic violence, fraud, scams, kidnapping, eve-teasing, chain snatching, stalking, vandalism, burglary
2. **Emergency** - Fire, explosion, building collapse, gas leak, drowning, medical emergency, bomb threat, natural disaster, accidents with casualties
3. **Traffic** - Signal failure, wrong-side driving, drunk driving, overspeeding, road rage, parking violations, hit-and-run, illegal modifications
4. **Infrastructure** - Potholes, broken roads, water leakage, streetlight failure, broken footpaths, damaged bridges, open manholes, construction debris
5. **Environmental** - Illegal dumping, garbage pile-up, sewage overflow, air pollution, noise pollution, water contamination, illegal tree cutting
6. **Public Health** - Contaminated food, disease outbreak, unhygienic restaurants, stagnant water breeding mosquitoes, open defecation, medical negligence
7. **Corruption** - Bribery, extortion by officials, misuse of power, fund misappropriation, fake bills, nepotism, document tampering
8. **Civic Services** - Water supply issues, electricity problems, ration card issues, pension delays, certificate delays, property tax disputes

**URGENCY LEVELS**:
- **Critical**: Immediate danger to life, ongoing crime, fire, medical emergency, accidents
- **High**: Serious safety concern, corruption affecting services, major infrastructure failure
- **Medium**: Quality of life issues, service delays, environmental concerns
- **Low**: Minor inconveniences, suggestions, general complaints

**INDIAN AUTHORITIES** (choose 2 most relevant):
- Police: Police Control Room (100), Local Police Station, Anti-Corruption Bureau, Cyber Crime Cell, Traffic Police, Women Helpline (181)
- Municipal: Municipal Corporation, PWD (Public Works), Water Board, Electricity Board (DISCOM), Sanitation Dept
- State: SDM Office, Tehsil Office, RTO, Food Safety (FSSAI), Pollution Control Board
- Emergency: Fire Brigade (101), Ambulance (108), Disaster Management, Hospital Administration
- Other: Consumer Forum, Vigilance Department, Chief Minister's Grievance Cell, Local MLA Office

Analyze this incident report and classify accurately based on the content:`;

/**
 * Analyzes a citizen-reported incident using Gemini AI.
 * Returns classification, urgency, summary, and routing authorities.
 *
 * Falls back to a default if AI is unavailable or API key is missing.
 */
export async function analyzeIncident(description: string): Promise<IncidentAnalysis> {
  // If no API key, return a sensible default
  if (!ai) {
    console.warn('[Gemini] No API key configured. Using fallback classification.');
    return getFallbackAnalysis(description);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${ANALYSIS_PROMPT}

INCIDENT REPORT: "${description}"

Analyze carefully and respond with accurate classification.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'Exactly one of: Crime / Safety, Emergency, Traffic, Infrastructure, Environmental, Public Health, Corruption, Civic Services'
            },
            urgency: {
              type: Type.STRING,
              description: 'Exactly one of: Critical, High, Medium, Low - based on immediacy and severity'
            },
            summary: {
              type: Type.STRING,
              description: 'Clear, professional 1-2 sentence summary of the incident that captures key details'
            },
            authorities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of exactly 2 most relevant Indian authorities from the guidelines - include specific department names'
            }
          },
          required: ['category', 'urgency', 'summary', 'authorities']
        },
        temperature: 0.3 // Lower temperature for more consistent classification
      }
    });

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw) as IncidentAnalysis;

    // Validate urgency is one of the expected values
    if (!['Critical', 'High', 'Medium', 'Low'].includes(parsed.urgency)) {
      parsed.urgency = 'Medium';
    }

    // Validate category
    const validCategories = ['Crime / Safety', 'Emergency', 'Traffic', 'Infrastructure', 'Environmental', 'Public Health', 'Corruption', 'Civic Services'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'General Concern';
    }

    // Ensure exactly 2 authorities
    if (!parsed.authorities || parsed.authorities.length === 0) {
      parsed.authorities = ['Local Police Station', 'Municipal Corporation'];
    } else if (parsed.authorities.length === 1) {
      parsed.authorities.push('Municipal Corporation');
    } else if (parsed.authorities.length > 2) {
      parsed.authorities = parsed.authorities.slice(0, 2);
    }

    return parsed;

  } catch (error) {
    console.error('[Gemini] Analysis failed:', error);
    return getFallbackAnalysis(description);
  }
}

/**
 * Fallback analysis when Gemini is unavailable.
 * Uses comprehensive keyword matching for classification.
 */
function getFallbackAnalysis(description: string): IncidentAnalysis {
  const lower = description.toLowerCase();

  let category = 'General Concern';
  let urgency: IncidentAnalysis['urgency'] = 'Medium';
  let authorities = ['Local Police Station', 'Municipal Corporation'];

  // Emergency - highest priority check
  if (lower.match(/fire|burn|explosion|blast|collapse|drowning|gas leak|bomb|casualt|dying|dead|murder|kidnap/)) {
    category = 'Emergency';
    urgency = 'Critical';
    authorities = ['Police Control Room (100)', 'Fire Brigade (101)'];
  }
  // Crime / Safety
  else if (lower.match(/theft|robbery|assault|harass|attack|stalking|abuse|violence|fraud|scam|chain.?snatch|eve.?teas|vandal|burgl/)) {
    category = 'Crime / Safety';
    urgency = 'Critical';
    authorities = ['Local Police Station', 'Police Control Room (100)'];
  }
  // Women-specific crimes
  else if (lower.match(/molest|rape|sexual|dowry|domestic.?violence|touching|women|girl|lady/)) {
    category = 'Crime / Safety';
    urgency = 'Critical';
    authorities = ['Women Helpline (181)', 'Local Police Station'];
  }
  // Corruption
  else if (lower.match(/brib|corrupt|extort|money.?demand|hafta|illegal.?fee|kickback|misuse.*power/)) {
    category = 'Corruption';
    urgency = 'High';
    authorities = ['Anti-Corruption Bureau', 'Vigilance Department'];
  }
  // Traffic
  else if (lower.match(/traffic|signal|wrong.?side|drunk.?driv|oversp|parking|hit.?and.?run|road.?rage|rash.?driv/)) {
    category = 'Traffic';
    urgency = lower.includes('accident') ? 'Critical' : 'Medium';
    authorities = ['Traffic Police', 'Local Police Station'];
  }
  // Infrastructure
  else if (lower.match(/pothole|road.*damage|broken.*road|water.*leak|pipe.*burst|street.?light|manhole|footpath|bridge/)) {
    category = 'Infrastructure';
    urgency = lower.includes('danger') || lower.includes('accident') ? 'High' : 'Medium';
    authorities = ['PWD (Public Works)', 'Municipal Corporation'];
  }
  // Environmental
  else if (lower.match(/garbage|dump|waste|sewage|pollution|smell|noise|contamina|tree.*cut|illegal.*construct/)) {
    category = 'Environmental';
    urgency = 'Medium';
    authorities = ['Sanitation Department', 'Pollution Control Board'];
  }
  // Public Health
  else if (lower.match(/food.?poison|disease|outbreak|mosquito|dengue|malaria|unhygien|contaminated.?food|stagnant.?water/)) {
    category = 'Public Health';
    urgency = 'High';
    authorities = ['Food Safety (FSSAI)', 'Municipal Health Officer'];
  }
  // Civic Services
  else if (lower.match(/water.*supply|electricity|power.*cut|ration|pension|certificate|license|property.*tax/)) {
    category = 'Civic Services';
    urgency = 'Medium';
    authorities = ['Municipal Corporation', 'SDM Office'];
  }

  return {
    category,
    urgency,
    summary: `Citizen report regarding ${category.toLowerCase()} incident requiring attention.`,
    authorities,
  };
}
