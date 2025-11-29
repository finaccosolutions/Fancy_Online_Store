import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, TrendingUp, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface GSTReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const AdminGSTReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const reportTypes: GSTReportType[] = [
    {
      id: 'bill-wise',
      name: 'Bill-wise GST Report',
      description: 'View GST breakdown for each invoice with item-wise details',
      icon: FileText
    },
    {
      id: 'customer-wise',
      name: 'Customer-wise GST Report',
      description: 'Aggregate GST data grouped by customer',
      icon: Users
    },
    {
      id: 'hsn-wise',
      name: 'HSN-wise GST Report',
      description: 'GST summary grouped by HSN/SAC codes',
      icon: Package
    },
    {
      id: 'gst-summary',
      name: 'GST Summary Report',
      description: 'Overall GST collection summary with CGST, SGST, and IGST breakdown',
      icon: TrendingUp
    }
  ];

  const fetchBillWiseReport = async () => {
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        invoice_number,
        created_at,
        subtotal,
        cgst_amount,
        sgst_amount,
        igst_amount,
        total_amount,
        customer_state,
        billing_address,
        users (full_name, email),
        order_items (
          id,
          quantity,
          price,
          gst_percentage,
          gst_amount,
          subtotal,
          product:products (name, hsn_code, price_inclusive_of_tax)
        )
      `)
      .order('created_at', { ascending: false });

    if (orderError) throw orderError;

    const billWiseData: any[] = [];
    orders?.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const priceInclusiveOfTax = item.product?.price_inclusive_of_tax || false;
        const gstPercentage = item.gst_percentage || 18;

        let taxableValue: number;
        let itemGST: number;
        let itemTotal: number;

        if (priceInclusiveOfTax) {
          itemTotal = item.price * item.quantity;
          taxableValue = (itemTotal * 100) / (100 + gstPercentage);
          itemGST = itemTotal - taxableValue;
        } else {
          taxableValue = item.price * item.quantity;
          itemGST = item.gst_amount || 0;
          itemTotal = taxableValue + itemGST;
        }

        const customerGSTIN = order.billing_address?.gstin || 'N/A';

        billWiseData.push({
          invoiceNumber: order.invoice_number || `INV-${order.id.slice(-8).toUpperCase()}`,
          invoiceDate: format(new Date(order.created_at), 'dd-MM-yyyy'),
          customerName: order.users?.full_name || 'N/A',
          customerGSTIN: customerGSTIN,
          itemName: item.product?.name || 'N/A',
          hsnCode: item.product?.hsn_code || 'N/A',
          quantity: item.quantity,
          rate: item.price,
          taxableValue: taxableValue,
          cgst: order.cgst_amount ? (order.cgst_amount * (taxableValue / order.subtotal)) : 0,
          sgst: order.sgst_amount ? (order.sgst_amount * (taxableValue / order.subtotal)) : 0,
          igst: order.igst_amount ? (order.igst_amount * (taxableValue / order.subtotal)) : 0,
          totalGST: itemGST,
          invoiceValue: itemTotal,
          customerState: order.customer_state
        });
      });
    });

    return billWiseData;
  };

  const fetchCustomerWiseReport = async () => {
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        subtotal,
        cgst_amount,
        sgst_amount,
        igst_amount,
        total_amount,
        billing_address,
        users (id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (orderError) throw orderError;

    const customerMap = new Map();

    orders?.forEach(order => {
      const customerId = order.users?.id || 'unknown';
      const customerName = order.users?.full_name || 'N/A';
      const customerEmail = order.users?.email || 'N/A';
      const customerGSTIN = order.billing_address?.gstin || 'N/A';
      const totalGST = (order.cgst_amount || 0) + (order.sgst_amount || 0) + (order.igst_amount || 0);

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerName,
          customerEmail,
          customerGSTIN,
          totalOrders: 0,
          totalTaxableValue: 0,
          totalCGST: 0,
          totalSGST: 0,
          totalIGST: 0,
          totalGST: 0,
          totalInvoiceValue: 0
        });
      }

      const customer = customerMap.get(customerId);
      customer.totalOrders++;
      customer.totalTaxableValue += order.subtotal || 0;
      customer.totalCGST += order.cgst_amount || 0;
      customer.totalSGST += order.sgst_amount || 0;
      customer.totalIGST += order.igst_amount || 0;
      customer.totalGST += totalGST;
      customer.totalInvoiceValue += order.total_amount || 0;
    });

    return Array.from(customerMap.values());
  };

  const fetchHSNWiseReport = async () => {
    const { data: orderItems, error: itemError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        gst_percentage,
        gst_amount,
        subtotal,
        product:products (name, hsn_code, price_inclusive_of_tax)
      `);

    if (itemError) throw itemError;

    const hsnMap = new Map();

    orderItems?.forEach((item: any) => {
      const hsnCode = item.product?.hsn_code || 'N/A';
      const productName = item.product?.name || 'N/A';
      const priceInclusiveOfTax = item.product?.price_inclusive_of_tax || false;
      const gstPercentage = item.gst_percentage || 18;

      let taxableValue: number;
      let itemGST: number;
      let itemTotal: number;

      if (priceInclusiveOfTax) {
        itemTotal = item.price * item.quantity;
        taxableValue = (itemTotal * 100) / (100 + gstPercentage);
        itemGST = itemTotal - taxableValue;
      } else {
        taxableValue = item.price * item.quantity;
        itemGST = item.gst_amount || 0;
        itemTotal = taxableValue + itemGST;
      }

      if (!hsnMap.has(hsnCode)) {
        hsnMap.set(hsnCode, {
          hsnCode,
          productName,
          totalQuantity: 0,
          totalTaxableValue: 0,
          gstRate: gstPercentage,
          totalGST: 0,
          totalValue: 0
        });
      }

      const hsn = hsnMap.get(hsnCode);
      hsn.totalQuantity += item.quantity;
      hsn.totalTaxableValue += taxableValue;
      hsn.totalGST += itemGST;
      hsn.totalValue += itemTotal;
    });

    return Array.from(hsnMap.values());
  };

  const fetchGSTSummaryReport = async () => {
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, subtotal, cgst_amount, sgst_amount, igst_amount, total_amount, created_at');

    if (orderError) throw orderError;

    const summary = {
      totalOrders: orders?.length || 0,
      totalTaxableValue: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      totalGST: 0,
      totalInvoiceValue: 0
    };

    orders?.forEach(order => {
      summary.totalTaxableValue += order.subtotal || 0;
      summary.totalCGST += order.cgst_amount || 0;
      summary.totalSGST += order.sgst_amount || 0;
      summary.totalIGST += order.igst_amount || 0;
      summary.totalGST += (order.cgst_amount || 0) + (order.sgst_amount || 0) + (order.igst_amount || 0);
      summary.totalInvoiceValue += order.total_amount || 0;
    });

    return [summary];
  };

  const fetchReportData = async (reportId: string) => {
    setLoading(true);
    setError(null);
    setReportData([]);

    try {
      let data: any[] = [];

      switch (reportId) {
        case 'bill-wise':
          data = await fetchBillWiseReport();
          break;
        case 'customer-wise':
          data = await fetchCustomerWiseReport();
          break;
        case 'hsn-wise':
          data = await fetchHSNWiseReport();
          break;
        case 'gst-summary':
          data = await fetchGSTSummaryReport();
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    fetchReportData(reportId);
  };

  const handleBack = () => {
    setSelectedReport(null);
    setReportData([]);
    setError(null);
  };

  const exportToCSV = () => {
    if (!reportData.length) return;

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gst-report-${selectedReport}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-admin-background text-admin-text p-8">
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-admin-text">GST Reports</h1>
            <p className="text-admin-text-light mt-1">Comprehensive GST reporting and analysis</p>
          </div>
          {selectedReport && (
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-success text-white rounded-lg hover:bg-admin-success/80 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-admin-border text-admin-text rounded-lg hover:bg-admin-sidebar transition-colors"
              >
                Back to Reports
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!selectedReport ? (
          <motion.div
            key="report-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {reportTypes.map(report => (
              <motion.button
                key={report.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleReportSelect(report.id)}
                className="bg-admin-card rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-admin-primary/10 p-3 rounded-lg">
                    <report.icon className="h-8 w-8 text-admin-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-admin-text mb-2">{report.name}</h2>
                    <p className="text-admin-text-light text-sm">{report.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
            <p>Loading report data...</p>
          </div>
        ) : (
          <motion.div
            key="report-data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-admin-card rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6">
              {reportTypes.find(r => r.id === selectedReport)?.name}
            </h2>

            {reportData.length === 0 ? (
              <div className="text-center py-12 text-admin-text-light">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>No data available for this report</p>
              </div>
            ) : (
              <div className="border border-admin-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-admin-border">
                    <thead className="bg-admin-sidebar">
                      <tr>
                        {Object.keys(reportData[0]).map(key => (
                          <th
                            key={key}
                            className="px-4 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider whitespace-nowrap"
                          >
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-admin-card divide-y divide-admin-border">
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-admin-sidebar transition-colors">
                          {Object.entries(row).map(([key, value], cellIdx) => (
                            <td key={cellIdx} className="px-4 py-3 whitespace-nowrap text-sm text-admin-text">
                              {typeof value === 'number' && (key.toLowerCase().includes('value') || key.toLowerCase().includes('gst') || key.toLowerCase().includes('cgst') || key.toLowerCase().includes('sgst') || key.toLowerCase().includes('igst'))
                                ? `₹${Math.round(value as number).toLocaleString()}`
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGSTReports;
