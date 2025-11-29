import { createClient } from 'npm:@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment verification data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'razorpay_key_secret')
      .maybeSingle();

    if (settingsError || !settingsData) {
      console.error('Error fetching Razorpay settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Payment gateway configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const razorpayKeySecret = settingsData.value;

    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const generatedSignatureHex = await hmacSha256(
      razorpayKeySecret,
      `${razorpay_order_id}|${razorpay_payment_id}`
    );

    if (generatedSignatureHex !== razorpay_signature) {
      console.error('Signature mismatch:', { generatedSignatureHex, razorpay_signature });
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature', verified: false }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader && authHeader !== `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const orderInsertData: any = {
      total_amount: orderData.total_amount,
      status: 'confirmed',
      payment_method: 'razorpay',
      payment_status: 'paid',
      razorpay_order_id,
      razorpay_payment_id,
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
      created_at: new Date().toISOString(),
    };

    if (userId) {
      orderInsertData.user_id = userId;
    } else {
      orderInsertData.guest_email = orderData.guest_email;
      orderInsertData.guest_phone = orderData.guest_phone || null;
      orderInsertData.guest_name = orderData.guest_name || null;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: orderError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
    }

    if (userId) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
    }

    return new Response(
      JSON.stringify({ verified: true, order }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-razorpay-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});