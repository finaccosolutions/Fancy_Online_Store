import { createClient } from 'npm:@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { amount, currency = 'INR', receipt } = await req.json();

    if (!amount || !receipt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, receipt' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['razorpay_key_id', 'razorpay_key_secret']);

    if (settingsError || !settingsData || settingsData.length === 0) {
      console.error('Error fetching Razorpay settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Payment gateway configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const settingsMap = settingsData.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const razorpayKeyId = settingsMap['razorpay_key_id'];
    const razorpayKeySecret = settingsMap['razorpay_key_secret'];

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay not configured. Please configure in admin settings.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const orderData = {
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: receipt,
      payment_capture: 1,
    };

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay API Error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create Razorpay order', details: errorData }),
        {
          status: razorpayResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: razorpayKeyId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in create-razorpay-order:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});