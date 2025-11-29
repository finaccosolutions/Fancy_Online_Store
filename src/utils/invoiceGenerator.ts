export interface InvoiceData {
  invoiceNumber: string;
  orderDate: string;
  customerName: string;
  customerAddress: any;
  customerGSTIN?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    gst_percentage: number;
    gst_amount: number;
    subtotal: number;
    hsn_code?: string;
  }>;
  subtotal: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalTax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  businessDetails: any;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const isCGSTSGST = data.cgst !== undefined && data.sgst !== undefined;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; background: white; }
    .invoice { max-width: 900px; margin: 0 auto; background: white; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #815536; padding-bottom: 20px; }
    .header h1 { color: #815536; font-size: 32px; margin-bottom: 10px; }
    .header p { color: #666; font-size: 14px; }
    .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-section { flex: 1; }
    .info-section h3 { color: #815536; margin-bottom: 10px; font-size: 16px; }
    .info-section p { color: #333; font-size: 14px; line-height: 1.6; }
    .invoice-details { background: #f8f8f8; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
    .invoice-details p { margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead { background: #815536; color: white; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { font-weight: 600; }
    td { color: #333; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .summary { margin-top: 30px; }
    .summary-row { display: flex; justify-content: flex-end; margin-bottom: 10px; }
    .summary-row .label { width: 200px; text-align: right; padding-right: 20px; font-weight: 600; color: #666; }
    .summary-row .value { width: 120px; text-align: right; color: #333; }
    .summary-row.total { font-size: 20px; color: #815536; border-top: 2px solid #815536; padding-top: 10px; margin-top: 10px; }
    .gst-breakdown { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .gst-breakdown h4 { color: #1976d2; margin-bottom: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px; }
    .notes { margin-top: 30px; padding: 15px; background: #f8f8f8; border-radius: 5px; }
    .notes h4 { color: #815536; margin-bottom: 10px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>${data.businessDetails.businessName || data.businessDetails.business_name || 'Business Name'}</h1>
      <p>${data.businessDetails.businessAddress || data.businessDetails.business_address || ''}, ${data.businessDetails.businessCity || data.businessDetails.business_city || ''}, ${data.businessDetails.businessState || data.businessDetails.business_state || ''} - ${data.businessDetails.businessPincode || data.businessDetails.business_pincode || ''}</p>
      <p>Phone: ${data.businessDetails.businessPhone || data.businessDetails.business_phone || ''} | Email: ${data.businessDetails.businessEmail || data.businessDetails.business_email || ''}</p>
      ${(data.businessDetails.gstNumber || data.businessDetails.gst_number) ? `<p><strong>GSTIN:</strong> ${data.businessDetails.gstNumber || data.businessDetails.gst_number}</p>` : ''}
    </div>

    <div class="invoice-details">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
          <p><strong>Invoice Date:</strong> ${new Date(data.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style="text-align: right;">
          <h2 style="color: #815536;">TAX INVOICE</h2>
        </div>
      </div>
    </div>

    <div class="invoice-info">
      <div class="info-section">
        <h3>Bill To:</h3>
        <p><strong>${data.customerName}</strong></p>
        <p>${data.customerAddress.address_line_1}</p>
        ${data.customerAddress.address_line_2 ? `<p>${data.customerAddress.address_line_2}</p>` : ''}
        <p>${data.customerAddress.city}, ${data.customerAddress.state} - ${data.customerAddress.postal_code}</p>
        <p>Phone: ${data.customerAddress.phone}</p>
        ${data.customerGSTIN ? `<p><strong>GSTIN:</strong> ${data.customerGSTIN}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Product Description</th>
          <th class="text-center">HSN Code</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Taxable Value</th>
          <th class="text-center">GST %</th>
          <th class="text-right">GST Amount</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td class="text-center">${item.hsn_code || '-'}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">₹${item.price.toLocaleString()}</td>
          <td class="text-right">₹${item.subtotal.toLocaleString()}</td>
          <td class="text-center">${item.gst_percentage}%</td>
          <td class="text-right">₹${Math.round(item.gst_amount).toLocaleString()}</td>
          <td class="text-right">₹${Math.round(item.subtotal + item.gst_amount).toLocaleString()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="gst-breakdown">
      <h4>Tax Breakdown</h4>
      ${isCGSTSGST ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Central GST (CGST):</span>
        <span><strong>₹${Math.round(data.cgst || 0).toLocaleString()}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>State GST (SGST):</span>
        <span><strong>₹${Math.round(data.sgst || 0).toLocaleString()}</strong></span>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 5px;">Note: Same state transaction</p>
      ` : `
      <div style="display: flex; justify-content: space-between;">
        <span>Integrated GST (IGST):</span>
        <span><strong>₹${Math.round(data.igst || 0).toLocaleString()}</strong></span>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 5px;">Note: Interstate transaction</p>
      `}
    </div>

    <div class="summary">
      <div class="summary-row">
        <div class="label">Subtotal (Taxable Value):</div>
        <div class="value">₹${Math.round(data.subtotal).toLocaleString()}</div>
      </div>
      <div class="summary-row">
        <div class="label">Total GST:</div>
        <div class="value">₹${Math.round(data.totalTax).toLocaleString()}</div>
      </div>
      ${data.shippingCharges > 0 ? `
      <div class="summary-row">
        <div class="label">Shipping Charges:</div>
        <div class="value">₹${Math.round(data.shippingCharges).toLocaleString()}</div>
      </div>
      ` : ''}
      ${data.discount > 0 ? `
      <div class="summary-row">
        <div class="label">Discount:</div>
        <div class="value">-₹${Math.round(data.discount).toLocaleString()}</div>
      </div>
      ` : ''}
      <div class="summary-row total">
        <div class="label">Total Amount:</div>
        <div class="value">₹${Math.round(data.total).toLocaleString()}</div>
      </div>
    </div>

    ${(data.businessDetails.invoiceTerms || data.businessDetails.invoice_terms) ? `
    <div class="notes">
      <h4>Terms & Conditions</h4>
      <p style="font-size: 14px; color: #666;">${data.businessDetails.invoiceTerms || data.businessDetails.invoice_terms}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>${data.businessDetails.invoiceFooter || data.businessDetails.invoice_footer || 'This is a computer generated invoice.'}</p>
      <p style="margin-top: 10px;">Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function downloadInvoice(data: InvoiceData) {
  const html = generateInvoiceHTML(data);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
