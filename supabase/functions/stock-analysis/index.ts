
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, stockData, analysisType = 'comprehensive' } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = createAnalysisPrompt(ticker, stockData, analysisType);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial analyst with expertise in stock market analysis, technical analysis, and fundamental analysis. Provide detailed, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      ticker,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in stock analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to analyze stock'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createAnalysisPrompt(ticker: string, stockData: any, analysisType: string): string {
  const basePrompt = `Analyze ${ticker} stock with the following data:\n\n`;
  
  let dataSection = '';
  if (stockData) {
    dataSection = `
Current Price: $${stockData.currentPrice || 'N/A'}
Market Cap: ${stockData.marketCap || 'N/A'}
Volume: ${stockData.volume || 'N/A'}
Day High/Low: ${stockData.dayHigh || 'N/A'} / ${stockData.dayLow || 'N/A'}
52 Week High/Low: ${stockData.yearHigh || 'N/A'} / ${stockData.yearLow || 'N/A'}
P/E Ratio: ${stockData.peRatio || 'N/A'}
Price Change: ${stockData.priceChange || 'N/A'} (${stockData.changePercent || 'N/A'}%)
`;
  }

  const analysisRequest = `
${dataSection}

Please provide a ${analysisType} analysis including:

1. **Technical Analysis**: Price action, trends, support/resistance levels
2. **Fundamental Overview**: Key financial metrics interpretation
3. **Market Sentiment**: Current market conditions affecting this stock
4. **Risk Assessment**: Potential risks and opportunities
5. **Investment Recommendation**: Buy/Hold/Sell with reasoning
6. **Price Targets**: Short-term and long-term price predictions
7. **Key Catalysts**: Upcoming events or factors that could impact price

Format your response in clear sections with actionable insights.
`;

  return basePrompt + analysisRequest;
}
