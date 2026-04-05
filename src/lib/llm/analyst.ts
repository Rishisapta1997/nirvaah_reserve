import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Nirvaah Enterprise AI',
  },
});

const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3.6-plus-04-02:free';

export interface LLMResponse {
  content: string;
  usage?: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
}

export interface LLMError {
  message: string;
  code?: string;
}

export async function callLLM(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<LLMResponse> {
  const { 
    model = DEFAULT_MODEL, 
    temperature = 0.7, 
    max_tokens = 4000,
    systemPrompt = 'You are an expert business analyst for Nirvaah Bags, a premium leather bags company. Provide actionable, data-driven insights. Always respond in valid JSON when JSON is requested.'
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens,
    });

    const content = response.choices[0]?.message?.content || '';
    
    return {
      content,
      usage: response.usage ? {
        input: response.usage.prompt_tokens || 0,
        output: response.usage.completion_tokens || 0,
        total: response.usage.total_tokens || 0,
      } : undefined,
      model: response.model,
    };
  } catch (error: any) {
    console.error('LLM API Error:', error);
    throw new Error(error.message || 'Failed to call LLM API');
  }
}

export async function callLLMWithJSON<T = any>(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    systemPrompt?: string;
    retries?: number;
  } = {}
): Promise<T> {
  const { retries = 2, ...rest } = options;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await callLLM(prompt, rest);
      
      let jsonStr = response.content.trim();
      
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      
      const parsed = JSON.parse(jsonStr.trim());
      return parsed;
    } catch (error: any) {
      console.error(`JSON parsing attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to parse LLM response after ${retries + 1} attempts: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error('Unexpected error in JSON parsing');
}

export async function generateInsights(
  prompt: string,
  insightType: 'daily' | 'weekly' | 'monthly'
): Promise<string> {
  const systemPrompt = `You are a senior business analyst for Nirvaah Bags, a premium leather bags company in India. 
You have deep knowledge of:
- E-commerce operations and sales optimization
- Inventory management and supply chain
- Customer behavior and retention strategies
- Digital marketing ROI and channel optimization
- Seasonal trends and festival season planning

Your response style:
- Be specific and actionable with numbers
- Prioritize by impact and urgency
- Consider local Indian market context (festivals, wedding season, etc.)
- Always provide reasoning behind recommendations

Generate insights in JSON format as requested.`;

  const response = await callLLM(prompt, {
    systemPrompt,
    temperature: 0.6,
    max_tokens: 3500,
  });

  return response.content;
}

export { openai };