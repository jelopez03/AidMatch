import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AnalysisResult, ProgramEligibility } from "../types";

const SYSTEM_INSTRUCTION = `You are a financial assistance expert. Analyze user profiles and return ONLY valid JSON matching the specified schema. You are empathetic but objective in your assessment.`;

const AID_PROGRAMS = [
  { id: "snap", name: "Supplemental Nutrition Assistance Program (SNAP)", category: "Food" },
  { id: "wic", name: "Women, Infants, and Children (WIC)", category: "Food/Health" },
  { id: "liheap", name: "Low Income Home Energy Assistance Program (LIHEAP)", category: "Utilities" },
  { id: "hcv", name: "Housing Choice Voucher Program (Section 8)", category: "Housing" },
  { id: "tanf", name: "Temporary Assistance for Needy Families (TANF)", category: "Cash Assistance" },
  { id: "eitc", name: "Earned Income Tax Credit (EITC)", category: "Tax Credit" },
  { id: "ctc", name: "Child Tax Credit", category: "Tax Credit" },
  { id: "medicaid", name: "Medicaid / CHIP", category: "Healthcare" }
];

const cleanJsonText = (text: string): string => {
  if (!text) return "";
  // Remove markdown code blocks (```json ... ```)
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeFinancialProfile = async (profile: UserProfile): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing. Please set it in your environment.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  SYSTEM CONTEXT:
  You are a financial assistance expert. Analyze this user's profile and return ONLY valid JSON.
  Output format: Pure JSON, no markdown, no text before or after.

  USER PROFILE DATA:
  ${JSON.stringify(profile, null, 2)}

  ANALYSIS TASK:
  Analyze this financial profile and return a JSON object with these EXACT fields:

  {
    "poverty_level_percent": <number 0-200>,
    "poverty_classification": "<very_low | low | moderate>",
    "monthly_deficit": <number>,
    "primary_hardships": [<list of strings like "food_insecurity", "housing_cost_burden">],
    "household_size": <number>,
    "dependents": <number>,
    "family_vulnerabilities": [<list of vulnerability factors>],
    "is_single_parent": <boolean>,
    "working_status": "<employed | unemployed | disabled | retired>",
    "estimated_eligibility_categories": [<list of program types they likely qualify for>]
  }

  DO NOT include any text outside the JSON.
  DO NOT use markdown backticks.
  Return ONLY the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poverty_level_percent: { type: Type.NUMBER },
            poverty_classification: { type: Type.STRING },
            monthly_deficit: { type: Type.NUMBER },
            primary_hardships: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            household_size: { type: Type.NUMBER },
            dependents: { type: Type.NUMBER },
            family_vulnerabilities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            is_single_parent: { type: Type.BOOLEAN },
            working_status: { type: Type.STRING },
            estimated_eligibility_categories: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
          required: [
            "poverty_level_percent", 
            "poverty_classification", 
            "monthly_deficit", 
            "primary_hardships", 
            "estimated_eligibility_categories"
          ]
        }
      }
    });

    const text = cleanJsonText(response.text || "");
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const checkProgramEligibility = async (profile: UserProfile, analysis: AnalysisResult): Promise<ProgramEligibility[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing. Please set it in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Calculate approximate 2024 Federal Poverty Line context for the prompt
  // Base $15,060 for 1 person + $5,380 for each additional person
  const fpl = 15060 + (profile.householdSize - 1) * 5380;
  const fplMonthly = Math.round(fpl / 12);
  
  const prompt = `
  SYSTEM CONTEXT:
  You are a financial assistance eligibility expert. Match this user profile to aid programs.
  Return ONLY valid JSON.

  USER PROFILE:
  ${JSON.stringify({ ...profile, analysis_summary: analysis }, null, 2)}

  AVAILABLE PROGRAMS DATABASE:
  ${JSON.stringify(AID_PROGRAMS, null, 2)}

  ELIGIBILITY MATCHING TASK:
  For each program in the database, assess eligibility for this user.
  Return a JSON array with these EXACT fields for each program:

  [
    {
      "program_id": "<string>",
      "program_name": "<string>",
      "category": "<string>",
      "eligible": <boolean true/false>,
      "confidence_score": <number 0-1>,
      "reason_eligible": "<string explaining why OR why not>",
      "estimated_monthly_benefit": <number or null>,
      "estimated_annual_benefit": <number or null>,
      "processing_days": <number>,
      "approval_likelihood_percent": <number 0-100>
    }
  ]

  ELIGIBILITY RULES (Use these to determine eligibility):
  - SNAP: Income < 130% federal poverty line, US citizen
  - WIC: Children under 5, income < 185% poverty, pregnant/postpartum/nursing
  - LIHEAP: Income < 150% poverty, utility hardship
  - Housing Vouchers: Income < 80% area median income, cost burden > 30% of income
  - TANF: Income < state limit (varies), work requirement in most cases
  - EITC: Working, dependent children
  - Child Tax Credit: Children under 17

  For this user profile:
  - Federal poverty line 2024 for ${profile.householdSize}-person household: $${fpl.toLocaleString()}/year (~$${fplMonthly.toLocaleString()}/month)
  - User annual income: $${(profile.monthlyIncome * 12).toLocaleString()}
  - User poverty percentage: ${analysis.poverty_level_percent}%

  DO NOT include any text outside the JSON array.
  DO NOT use markdown backticks.
  Return ONLY the JSON array, starting with [ and ending with ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              program_id: { type: Type.STRING },
              program_name: { type: Type.STRING },
              category: { type: Type.STRING },
              eligible: { type: Type.BOOLEAN },
              confidence_score: { type: Type.NUMBER },
              reason_eligible: { type: Type.STRING },
              estimated_monthly_benefit: { type: Type.NUMBER, nullable: true },
              estimated_annual_benefit: { type: Type.NUMBER, nullable: true },
              processing_days: { type: Type.NUMBER },
              approval_likelihood_percent: { type: Type.NUMBER },
            },
            required: ["program_id", "program_name", "eligible", "reason_eligible", "approval_likelihood_percent"]
          }
        }
      }
    });

    const text = cleanJsonText(response.text || "");
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(text) as ProgramEligibility[];
  } catch (error) {
    console.error("Gemini Eligibility Check Error:", error);
    // Return empty array on error to allow main analysis to still show
    return [];
  }
};
