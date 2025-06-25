
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlphaVantageRequest {
  ticker: string;
  dataType: 'overview' | 'income_statement' | 'balance_sheet' | 'cash_flow' | 'earnings';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, dataType }: AlphaVantageRequest = await req.json();
    
    if (!ticker || !dataType) {
      return new Response(
        JSON.stringify({ error: 'Missing ticker or dataType' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Alpha Vantage API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let functionName = '';
    switch (dataType) {
      case 'overview':
        functionName = 'OVERVIEW';
        break;
      case 'income_statement':
        functionName = 'INCOME_STATEMENT';
        break;
      case 'balance_sheet':
        functionName = 'BALANCE_SHEET';
        break;
      case 'cash_flow':
        functionName = 'CASH_FLOW';
        break;
      case 'earnings':
        functionName = 'EARNINGS';
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid dataType' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

    const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${ticker}&apikey=${apiKey}`;
    
    console.log(`Fetching Alpha Vantage data: ${functionName} for ${ticker}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      return new Response(
        JSON.stringify({ error: data['Error Message'] }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (data['Note']) {
      return new Response(
        JSON.stringify({ error: 'API call frequency limit reached. Please try again later.' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
