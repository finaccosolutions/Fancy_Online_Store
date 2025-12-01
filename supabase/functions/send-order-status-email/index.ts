import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StatusUpdateRequest {
  orderId: string;
  newStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  customerEmail?: string;
  customerName?: string;
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount?: number;
  shippingAddress?: any;
  paymentMethod?: string;
}

function generateStatusUpdateEmailHTML(
  orderId: string,
  customerName: string,
  newStatus: string,
  trackingNumber?: string,
  estimatedDelivery?: string,
  siteName?: string,
  orderItems?: Array<{ name: string; quantity: number; price: number }>,
  totalAmount?: number,
  shippingAddress?: any,
  paymentMethod?: string,
  currencySymbol?: string
): string {
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared for shipment.",
    shipped: "Your order has been shipped! You can track your package using the tracking number below.",
    delivered: "Your order has been delivered! We hope you enjoy your purchase.",
    cancelled: "Your order has been cancelled. If you have any questions, please contact us.",
  };

  const statusColors: Record<string, string> = {
    confirmed: "#FF9800",
    shipped: "#2196F3",
    delivered: "#4CAF50",
    cancelled: "#F44336",
  };

  const statusMessage = statusMessages[newStatus] || "Your order status has been updated.";
  const statusColor = statusColors[newStatus] || "#2196F3";
  const displayStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
  const currency = currencySymbol || '₹';

  const itemsHTML = orderItems ? orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currency}${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currency}${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('') : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #815536, #c9baa8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${siteName || 'Velora Tradings'}</h1>
        <p style="color: #f5f5f5; margin: 10px 0 0 0;">Order Status Update</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #815536; margin-top: 0;">Hi ${customerName},</h2>
        <p style="font-size: 16px;">${statusMessage}</p>

        <div style="background: #f8f8f8; padding: 20px; border-left: 4px solid ${statusColor}; border-radius: 5px; margin: 20px 0;">
          <div style="text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: ${statusColor}; font-size: 24px;">${displayStatus}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        ${orderItems && orderItems.length > 0 ? `
          <h3 style="color: #815536; margin-top: 30px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background: #f8f8f8;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #815536;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #815536;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #815536;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #815536;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Total Amount:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #815536;">${currency}${totalAmount ? totalAmount.toLocaleString() : '0'}</td>
              </tr>
            </tfoot>
          </table>
        ` : ''}

        ${trackingNumber ? `
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #2196F3;">Tracking Information</h4>
            <p style="margin: 0; color: #666;"><strong>Tracking Number:</strong></p>
            <p style="margin: 10px 0; font-size: 18px; font-weight: bold; color: #2196F3; word-break: break-all;">${trackingNumber}</p>
          </div>
        ` : ''}

        ${estimatedDelivery ? `
          <div style="background: #f0f8f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #4CAF50;">Estimated Delivery</h4>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #4CAF50;">${new Date(estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        ` : ''}

        ${shippingAddress ? `
          <h3 style="color: #815536; margin-top: 30px;">Shipping Address</h3>
          <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
            <p style="margin: 5px 0;">${shippingAddress.full_name || ''}</p>
            <p style="margin: 5px 0;">${shippingAddress.address_line_1 || ''}${shippingAddress.address_line_2 ? ', ' + shippingAddress.address_line_2 : ''}</p>
            <p style="margin: 5px 0;">${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}</p>
            <p style="margin: 5px 0;">Phone: ${shippingAddress.phone || ''}</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; text-align: center;">
          <p style="margin: 0;">Need help? Contact us or check your order details in your account.</p>
        </div>
      </div>

      <div style="background: #815536; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: white; margin: 0; font-size: 14px;">© 2025 ${siteName || 'Velora Tradings'}. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  smtpConfig: any
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!smtpConfig.smtp_host || !smtpConfig.smtp_port || !smtpConfig.smtp_user || !smtpConfig.smtp_password || !smtpConfig.smtp_from_email) {
      console.error('Missing SMTP configuration in database.');
      return { success: false, error: 'SMTP configuration missing. Please configure SMTP settings in admin panel.' };
    }

    const nodemailer = await import('npm:nodemailer@6.9.7');

    const transporter = nodemailer.default.createTransport({
      host: smtpConfig.smtp_host,
      port: parseInt(smtpConfig.smtp_port),
      secure: smtpConfig.smtp_secure === true || smtpConfig.smtp_port == 465,
      auth: {
        user: smtpConfig.smtp_user,
        pass: smtpConfig.smtp_password,
      },
    });

    const mailOptions = {
      from: `${smtpConfig.smtp_from_name || 'Velora Tradings'} <${smtpConfig.smtp_from_email}>`,
      to: to,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log('Status update email sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      orderId,
      newStatus,
      trackingNumber,
      estimatedDelivery,
      customerEmail,
      customerName,
      orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    }: StatusUpdateRequest = await req.json();

    if (!orderId || !newStatus || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settingsArray, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value');

    if (settingsError || !settingsArray) {
      console.error('Failed to fetch site settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch site settings' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const settings: Record<string, any> = {};
    settingsArray.forEach((setting: any) => {
      settings[setting.key] = setting.value;
    });

    let finalOrderItems = orderItems;
    let finalTotalAmount = totalAmount;
    let finalShippingAddress = shippingAddress;
    let finalPaymentMethod = paymentMethod;

    if (!orderItems || orderItems.length === 0) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          total_amount,
          payment_method,
          shipping_address,
          order_items (
            quantity,
            price,
            product:products (
              name
            )
          )
        `)
        .eq('id', orderId)
        .maybeSingle();

      if (!orderError && orderData) {
        finalOrderItems = orderData.order_items?.map((item: any) => ({
          name: item.product?.name || 'Product',
          quantity: item.quantity,
          price: item.price
        })) || [];
        finalTotalAmount = orderData.total_amount;
        finalShippingAddress = orderData.shipping_address;
        finalPaymentMethod = orderData.payment_method;
      }
    }

    const siteName = settings.site_name || 'Velora Tradings';
    const currencySymbol = settings.currency_symbol || '₹';
    const html = generateStatusUpdateEmailHTML(
      orderId,
      customerName || 'Customer',
      newStatus,
      trackingNumber,
      estimatedDelivery,
      siteName,
      finalOrderItems,
      finalTotalAmount,
      finalShippingAddress,
      finalPaymentMethod,
      currencySymbol
    );

    const subject = `Order Status Update: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
    const result = await sendEmail(customerEmail, subject, html, settings);

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Status update email sent successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to send email', warning: 'Order was updated but email notification failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-order-status-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});