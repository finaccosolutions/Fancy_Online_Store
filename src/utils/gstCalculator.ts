import { TaxBreakdown } from '../types';
import { indianStates } from '../data/indianStates';

interface CartItemWithGST {
  product: {
    price: number;
    original_price?: number;
    gst_percentage?: number;
    price_inclusive_of_tax?: boolean;
  };
  quantity: number;
}

export interface GSTSettings {
  businessState: string;
}

export function calculateGSTBreakdown(
  items: CartItemWithGST[],
  customerState: string,
  shippingCharges: number,
  discountAmount: number,
  businessState: string = 'Maharashtra'
): TaxBreakdown {
  let subtotal = 0;
  let totalGST = 0;

items.forEach(item => {
  const gstPercentage = item.product.gst_percentage || 18;
  const priceInclusiveOfTax = item.product.price_inclusive_of_tax !== false; // Default to true

  if (priceInclusiveOfTax) {
    // Price already includes tax - extract the base price
    const priceWithTax = item.product.price * item.quantity;
    const taxableValue = (priceWithTax * 100) / (100 + gstPercentage);
    const itemGST = priceWithTax - taxableValue;

    subtotal += taxableValue;
    totalGST += itemGST;
  } else {
    // Price excludes tax - add tax on top
    const itemSubtotal = item.product.price * item.quantity;
    const itemGST = (itemSubtotal * gstPercentage) / 100;

    subtotal += itemSubtotal;
    totalGST += itemGST;
  }
});

  const isSameState = customerState.toLowerCase() === businessState.toLowerCase();

  const breakdown: TaxBreakdown = {
    subtotal,
    totalTax: totalGST,
    shipping: shippingCharges,
    discount: discountAmount,
    total: subtotal + totalGST + shippingCharges - discountAmount,
  };

  if (isSameState) {
    breakdown.cgst = totalGST / 2;
    breakdown.sgst = totalGST / 2;
  } else {
    breakdown.igst = totalGST;
  }

  return breakdown;
}

export function formatGSTAmount(amount: number): string {
  return `₹${Math.round(amount).toLocaleString()}`;
}

export function getGSTLabel(customerState: string, businessState: string): 'CGST+SGST' | 'IGST' {
  return customerState.toLowerCase() === businessState.toLowerCase() ? 'CGST+SGST' : 'IGST';
}
