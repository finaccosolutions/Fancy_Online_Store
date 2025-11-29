import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  subject: string;
  orderData: {
    orderId: string;
    customerName: string;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    shippingAddress: any;
    paymentMethod: string;
    orderDate: string;
  };
}

function generateCustomerEmailHTML(data: EmailRequest['orderData'], siteName: string, currencySymbol: string): string {
  const itemsHTML = data.orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #815536, #c9baa8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${siteName}</h1>
        <p style="color: #f5f5f5; margin: 10px 0 0 0;">Order Confirmation</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #815536; margin-top: 0;">Thank you for your order!</h2>
        <p>Hi ${data.customerName},</p>
        <p>We're excited to confirm that we've received your order. Your purchase is being processed and will be shipped soon.</p>

        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #815536;">Order Details</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${data.orderId.slice(-8)}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
        </div>

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
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #815536;">${currencySymbol}${data.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="color: #815536; margin-top: 30px;">Shipping Address</h3>
        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
          <p style="margin: 5px 0;">${data.shippingAddress.full_name}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.address_line_1}${data.shippingAddress.address_line_2 ? ', ' + data.shippingAddress.address_line_2 : ''}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}</p>
          <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; text-align: center;">
          <p style="margin: 0;">Need help? Contact us or check your order status anytime.</p>
        </div>
      </div>

      <div style="background: #815536; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: white; margin: 0; font-size: 14px;">© 2025 ${siteName}. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

function generateAdminEmailHTML(data: EmailRequest['orderData'], siteName: string, currencySymbol: string): string {
  const itemsHTML = data.orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${currencySymbol}${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #815536, #c9baa8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${siteName}</h1>
        <p style="color: #f5f5f5; margin: 10px 0 0 0;">New Order Received</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #815536; margin-top: 0;">New Order Notification</h2>
        <p style="color: #ff6b00; font-weight: bold;">Action Required: Process this order</p>

        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #815536;">Order Details</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${data.orderId.slice(-8)}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${data.customerName}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
        </div>

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
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #815536;">${currencySymbol}${data.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="color: #815536; margin-top: 30px;">Shipping Address</h3>
        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
          <p style="margin: 5px 0;">${data.shippingAddress.full_name}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.address_line_1}${data.shippingAddress.address_line_2 ? ', ' + data.shippingAddress.address_line_2 : ''}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}</p>
          <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; text-align: center;">
          <p style="margin: 0; color: #856404;"><strong>Action Required:</strong> Log in to the admin panel to process this order</p>
        </div>
      </div>

      <div style="background: #815536; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: white; margin: 0; font-size: 14px;">© 2025 ${siteName}. All rights reserved.</p>
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
    console.log('Email sent successfully to:', to);
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
    const { to, subject, orderData, sendToAdmin }: EmailRequest & { sendToAdmin?: boolean } = await req.json();

    if (!subject || !orderData) {
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
        JSON.stringify({ error: 'Failed to fetch site settings. Please configure SMTP in admin panel.' }),
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

    let recipientEmail = to;
    if (sendToAdmin) {
      recipientEmail = settings.admin_email || 'admin@example.com';
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'No recipient email address' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const siteName = settings.site_name || 'Velora Tradings';
    const currencySymbol = settings.currency_symbol || '₹';
    const html = sendToAdmin
      ? generateAdminEmailHTML(orderData, siteName, currencySymbol)
      : generateCustomerEmailHTML(orderData, siteName, currencySymbol);
    const result = await sendEmail(recipientEmail, subject, html, settings);

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to send email', warning: 'Order was placed successfully but email notification failed. Please check SMTP configuration in admin panel.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});