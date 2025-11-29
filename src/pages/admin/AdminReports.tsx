// src/pages/admin/AdminReports.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Users, ShoppingCart, Package, DollarSign, TrendingUp, Activity, BarChart, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ReportColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ReportType {
  id: string;
  name: string;
  icon: React.ElementType;
  fetchData: () => Promise<{ data: any[]; columns: ReportColumn[]; error: string | null }>;
}

const AdminReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportColumns, setReportColumns] = useState<ReportColumn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  const reportDefinitions: ReportType[] = [
    {
      id: 'sales_report',
      name: 'Sales Report',
      icon: DollarSign,
      fetchData: async () => {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            id,
            invoice_number,
            subtotal,
            total_amount,
            cgst_amount,
            sgst_amount,
            igst_amount,
            status,
            payment_method,
            payment_status,
            created_at,
            users (full_name, email)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) return { data: [], columns: [], error: fetchError.message };

        const columns: ReportColumn[] = [
          { key: 'invoice_number', label: 'Invoice #', render: (value) => value || 'N/A' },
          { key: 'user_name', label: 'Customer', render: (value, row) => row.users?.full_name || 'N/A' },
          { key: 'subtotal', label: 'Subtotal (excl. tax)', render: (value) => `₹${Math.round(value || 0).toLocaleString()}` },
          { key: 'tax_amount', label: 'Total Tax', render: (value, row) => {
            const totalTax = (row.cgst_amount || 0) + (row.sgst_amount || 0) + (row.igst_amount || 0);
            return `₹${Math.round(totalTax).toLocaleString()}`;
          }},
          { key: 'total_amount', label: 'Total (incl. tax)', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'status', label: 'Status', render: (value) => value.charAt(0).toUpperCase() + value.slice(1) },
          { key: 'payment_method', label: 'Payment', render: (value) => value.toUpperCase() },
          { key: 'created_at', label: 'Date', render: (value) => format(new Date(value), 'MMM dd, yyyy') },
        ];
        return { data: data || [], columns, error: null };
      },
    },
    {
      id: 'product_inventory',
      name: 'Product Inventory',
      icon: Package,
      fetchData: async () => {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            in_stock,
            rating,
            reviews_count,
            categories (name)
          `)
          .order('name', { ascending: true });

        if (fetchError) return { data: [], columns: [], error: fetchError.message };

        const columns: ReportColumn[] = [
          { key: 'id', label: 'Product ID', render: (value) => value.substring(0, 8) + '...' },
          { key: 'name', label: 'Product Name' },
          { key: 'category_name', label: 'Category', render: (value, row) => row.categories?.name || 'N/A' },
          { key: 'price', label: 'Price', render: (value) => `₹${value.toLocaleString()}` },
          { key: 'in_stock', label: 'In Stock', render: (value) => value ? 'Yes' : 'No' },
          { key: 'rating', label: 'Rating' },
          { key: 'reviews_count', label: 'Reviews Count' },
        ];
        return { data: data || [], columns, error: null };
      },
    },
    {
      id: 'user_list',
      name: 'User List',
      icon: Users,
      fetchData: async () => {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select(`
            id,
            email,
            full_name,
            phone,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (fetchError) return { data: [], columns: [], error: fetchError.message };

        const columns: ReportColumn[] = [
          { key: 'id', label: 'User ID', render: (value) => value.substring(0, 8) + '...' },
          { key: 'full_name', label: 'Full Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'created_at', label: 'Joined Date', render: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm') },
        ];
        return { data: data || [], columns, error: null };
      },
    },
    {
      id: 'order_items_report',
      name: 'Order Items Report',
      icon: ShoppingCart,
      fetchData: async () => {
        const { data, error: fetchError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            product_id,
            quantity,
            price,
            products (name),
            orders (created_at, users (full_name))
          `)
          .order('orders(created_at)', { ascending: false });

        if (fetchError) return { data: [], columns: [], error: fetchError.message };

        const columns: ReportColumn[] = [
          { key: 'order_id', label: 'Order ID', render: (value) => value.substring(0, 8) + '...' },
          { key: 'product_name', label: 'Product Name', render: (value, row) => row.products?.name || 'N/A' },
          { key: 'customer_name', label: 'Customer', render: (value, row) => row.orders?.users?.full_name || 'N/A' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'price', label: 'Unit Price', render: (value) => `₹${value.toLocaleString()}` },
          { key: 'total', label: 'Total', render: (value, row) => `₹${(row.quantity * row.price).toLocaleString()}` },
          { key: 'order_date', label: 'Order Date', render: (value, row) => format(new Date(row.orders?.created_at), 'MMM dd, yyyy') },
        ];
        return { data: data || [], columns, error: null };
      },
    },
    {
      id: 'top_selling_products',
      name: 'Top Selling Products',
      icon: TrendingUp,
      fetchData: async () => {
        const { data, error: fetchError } = await supabase
          .from('order_items')
          .select(`
            product_id,
            quantity,
            products (name, price)
          `);

        if (fetchError) return { data: [], columns: [], error: fetchError.message };

        const productSales: Record<string, { name: string; totalQuantity: number; totalRevenue: number; price: number }> = {};

        data.forEach((item: any) => {
          const productId = item.product_id;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.products?.name || 'N/A',
              totalQuantity: 0,
              totalRevenue: 0,
              price: item.products?.price || 0
            };
          }
          productSales[productId].totalQuantity += item.quantity;
          productSales[productId].totalRevenue += item.quantity * (item.products?.price || 0);
        });

        const aggregatedData = Object.entries(productSales)
          .map(([productId, data]) => ({
            product_id: productId,
            product_name: data.name,
            total_quantity: data.totalQuantity,
            total_revenue: data.totalRevenue,
            price: data.price
          }))
          .sort((a, b) => b.total_quantity - a.total_quantity);

        const columns: ReportColumn[] = [
          { key: 'product_id', label: 'Product ID', render: (value) => value.substring(0, 8) + '...' },
          { key: 'product_name', label: 'Product Name' },
          { key: 'price', label: 'Unit Price', render: (value) => `₹${value.toLocaleString()}` },
          { key: 'total_quantity', label: 'Total Sold' },
          { key: 'total_revenue', label: 'Total Revenue', render: (value) => `₹${value.toLocaleString()}` },
        ];
        return { data: aggregatedData, columns, error: null };
      },
    },
    {
      id: 'revenue_by_payment',
      name: 'Revenue by Payment Method',
      icon: BarChart,
      fetchData: async () => {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('payment_method, total_amount, status');

        if (fetchError) return { data: [], columns: [], error: fetchError.message };

        const paymentStats: Record<string, { totalOrders: number; totalRevenue: number; completedOrders: number }> = {};

        data.forEach((order: any) => {
          const method = order.payment_method || 'unknown';
          if (!paymentStats[method]) {
            paymentStats[method] = { totalOrders: 0, totalRevenue: 0, completedOrders: 0 };
          }
          paymentStats[method].totalOrders++;
          paymentStats[method].totalRevenue += order.total_amount;
          if (order.status === 'delivered' || order.status === 'completed') {
            paymentStats[method].completedOrders++;
          }
        });

        const aggregatedData = Object.entries(paymentStats).map(([method, stats]) => ({
          payment_method: method.toUpperCase(),
          total_orders: stats.totalOrders,
          completed_orders: stats.completedOrders,
          total_revenue: stats.totalRevenue,
          average_order_value: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0
        }));

        const columns: ReportColumn[] = [
          { key: 'payment_method', label: 'Payment Method' },
          { key: 'total_orders', label: 'Total Orders' },
          { key: 'completed_orders', label: 'Completed Orders' },
          { key: 'total_revenue', label: 'Total Revenue', render: (value) => `₹${value.toLocaleString()}` },
          { key: 'average_order_value', label: 'Avg Order Value', render: (value) => `₹${value.toFixed(2)}` },
        ];
        return { data: aggregatedData, columns, error: null };
      },
    },
    {
      id: 'admin_activity_logs',
      name: 'Admin Activity Logs',
      icon: Activity,
      fetchData: async () => {
        const { data, error: fetchError } = await supabase
          .from('admin_activity_logs')
          .select(`
            id,
            action,
            resource_type,
            resource_id,
            details,
            created_at,
            users (full_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (fetchError) return { data: [], columns: [], error: fetchError.message };

        const columns: ReportColumn[] = [
          { key: 'admin_name', label: 'Admin', render: (value, row) => row.users?.full_name || row.users?.email || 'N/A' },
          { key: 'action', label: 'Action' },
          { key: 'resource_type', label: 'Resource Type' },
          { key: 'resource_id', label: 'Resource ID', render: (value) => value ? value.substring(0, 8) + '...' : 'N/A' },
          { key: 'created_at', label: 'Date & Time', render: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm:ss') },
        ];
        return { data: data || [], columns, error: null };
      },
    },
    {
      id: 'gst_bill_wise',
      name: 'GST Report - Bill-wise',
      icon: Receipt,
      fetchData: async () => {
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

        if (orderError) return { data: [], columns: [], error: orderError.message };

        const billWiseData: any[] = [];
        orders?.forEach(order => {
          order.order_items?.forEach((item: any) => {
            const priceInclusive = item.product?.price_inclusive_of_tax || false;
            const gstPercentage = item.gst_percentage || 18;
            let itemTaxableValue, itemGST, itemTotal;

            if (priceInclusive) {
              // Price includes tax, so calculate taxable value
              const totalAmount = item.price * item.quantity;
              itemTaxableValue = totalAmount / (1 + gstPercentage / 100);
              itemGST = totalAmount - itemTaxableValue;
              itemTotal = totalAmount;
            } else {
              // Price excludes tax
              itemTaxableValue = item.subtotal || (item.price * item.quantity);
              itemGST = item.gst_amount || 0;
              itemTotal = itemTaxableValue + itemGST;
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
              taxableValue: itemTaxableValue,
              cgst: order.cgst_amount ? (order.cgst_amount * (itemTaxableValue / order.subtotal)) : 0,
              sgst: order.sgst_amount ? (order.sgst_amount * (itemTaxableValue / order.subtotal)) : 0,
              igst: order.igst_amount ? (order.igst_amount * (itemTaxableValue / order.subtotal)) : 0,
              totalGST: itemGST,
              invoiceValue: itemTotal,
              customerState: order.customer_state
            });
          });
        });

        const columns: ReportColumn[] = [
          { key: 'invoiceNumber', label: 'Invoice #' },
          { key: 'invoiceDate', label: 'Date' },
          { key: 'customerName', label: 'Customer' },
          { key: 'customerGSTIN', label: 'GSTIN' },
          { key: 'itemName', label: 'Item Name' },
          { key: 'hsnCode', label: 'HSN Code' },
          { key: 'quantity', label: 'Qty' },
          { key: 'rate', label: 'Rate', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'taxableValue', label: 'Taxable Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'cgst', label: 'CGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'sgst', label: 'SGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'igst', label: 'IGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalGST', label: 'Total Tax', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'invoiceValue', label: 'Invoice Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
        ];
        return { data: billWiseData, columns, error: null };
      },
    },
    {
      id: 'gst_customer_wise',
      name: 'GST Report - Customer-wise',
      icon: Users,
      fetchData: async () => {
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

        if (orderError) return { data: [], columns: [], error: orderError.message };

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

        const customerData = Array.from(customerMap.values());

        const columns: ReportColumn[] = [
          { key: 'customerName', label: 'Customer Name' },
          { key: 'customerEmail', label: 'Email' },
          { key: 'customerGSTIN', label: 'GSTIN' },
          { key: 'totalOrders', label: 'Total Orders' },
          { key: 'totalTaxableValue', label: 'Taxable Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalCGST', label: 'Total CGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalSGST', label: 'Total SGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalIGST', label: 'Total IGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalGST', label: 'Total Tax', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalInvoiceValue', label: 'Total Invoice Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
        ];
        return { data: customerData, columns, error: null };
      },
    },
    {
      id: 'gst_hsn_wise',
      name: 'GST Report - HSN-wise',
      icon: Package,
      fetchData: async () => {
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

        if (itemError) return { data: [], columns: [], error: itemError.message };

        const hsnMap = new Map();

        orderItems?.forEach((item: any) => {
          const hsnCode = item.product?.hsn_code || 'N/A';
          const productName = item.product?.name || 'N/A';
          const priceInclusive = item.product?.price_inclusive_of_tax || false;
          const gstPercentage = item.gst_percentage || 18;

          let itemTaxableValue, itemGST, itemTotal;

          if (priceInclusive) {
            const totalAmount = item.price * item.quantity;
            itemTaxableValue = totalAmount / (1 + gstPercentage / 100);
            itemGST = totalAmount - itemTaxableValue;
            itemTotal = totalAmount;
          } else {
            itemTaxableValue = item.subtotal || (item.price * item.quantity);
            itemGST = item.gst_amount || 0;
            itemTotal = itemTaxableValue + itemGST;
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
          hsn.totalTaxableValue += itemTaxableValue;
          hsn.totalGST += itemGST;
          hsn.totalValue += itemTotal;
        });

        const hsnData = Array.from(hsnMap.values());

        const columns: ReportColumn[] = [
          { key: 'hsnCode', label: 'HSN Code' },
          { key: 'productName', label: 'Product Name' },
          { key: 'totalQuantity', label: 'Total Quantity' },
          { key: 'gstRate', label: 'GST Rate (%)', render: (value) => `${value}%` },
          { key: 'totalTaxableValue', label: 'Taxable Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalGST', label: 'Total Tax', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalValue', label: 'Total Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
        ];
        return { data: hsnData, columns, error: null };
      },
    },
    {
      id: 'gst_summary',
      name: 'GST Report - Summary',
      icon: TrendingUp,
      fetchData: async () => {
        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select('id, subtotal, cgst_amount, sgst_amount, igst_amount, total_amount, created_at');

        if (orderError) return { data: [], columns: [], error: orderError.message };

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

        const columns: ReportColumn[] = [
          { key: 'totalOrders', label: 'Total Orders' },
          { key: 'totalTaxableValue', label: 'Total Taxable Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalCGST', label: 'Total CGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalSGST', label: 'Total SGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalIGST', label: 'Total IGST', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalGST', label: 'Total Tax', render: (value) => `₹${Math.round(value).toLocaleString()}` },
          { key: 'totalInvoiceValue', label: 'Total Invoice Value', render: (value) => `₹${Math.round(value).toLocaleString()}` },
        ];
        return { data: [summary], columns, error: null };
      },
    },
  ];

  const fetchAndSetReportData = useCallback(async (reportId: string) => {
    setLoading(true);
    setError(null);
    setReportData([]);
    setReportColumns([]);

    const definition = reportDefinitions.find(r => r.id === reportId);
    if (!definition) {
      setError('Report definition not found.');
      setLoading(false);
      return;
    }

    const { data, columns, error: fetchError } = await definition.fetchData();
    if (fetchError) {
      setError(fetchError);
    } else {
      setReportData(data);
      setReportColumns(columns);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedReportType) {
      fetchAndSetReportData(selectedReportType);
    }
  }, [selectedReportType, fetchAndSetReportData]);

  const handleReportSelect = (reportId: string) => {
    setSelectedReportType(reportId);
  };

  const handleBackToReports = () => {
    setSelectedReportType(null);
    setReportData([]);
    setReportColumns([]);
    setError(null);
  };

  const exportToCsv = () => {
    if (!reportData.length || !reportColumns.length) {
      alert('No data to export.');
      return;
    }

    const header = reportColumns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    const rows = reportData.map(row => {
      return reportColumns.map(col => {
        let value = row[col.key];
        if (col.render) {
          // Use a temporary div to get plain text from ReactNode
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = ReactDOMServer.renderToStaticMarkup(col.render(value, row) as React.ReactElement);
          value = tempDiv.textContent || '';
        }
        // Handle nested properties for direct access (e.g., product.name)
        if (typeof value === 'object' && value !== null) {
          // This is a basic flattening, might need more robust solution for deep nesting
          value = JSON.stringify(value);
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${selectedReportType || 'report'}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // You'll need to import ReactDOMServer for renderToStaticMarkup
  // For client-side only, you might need a different approach or simpler rendering for CSV
  // For this example, I'll add a mock import for ReactDOMServer.
  // In a real app, you'd typically import it from 'react-dom/server'
  // and ensure your build setup supports it for client-side usage if needed,
  // or simplify the render logic for CSV to only handle primitive types.
  const ReactDOMServer = {
    renderToStaticMarkup: (element: React.ReactElement) => {
      // Simplified mock for client-side. In a real app, this would be from 'react-dom/server'
      // or you'd ensure your render functions for columns return strings/numbers for CSV.
      if (typeof element === 'string' || typeof element === 'number') {
        return String(element);
      }
      // Fallback for more complex elements, might not be perfect for all cases
      return JSON.stringify(element);
    }
  };


  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const generalReports = reportDefinitions.filter(r => !r.id.startsWith('gst_'));
  const gstReports = reportDefinitions.filter(r => r.id.startsWith('gst_'));

  return (
    <div className="min-h-screen bg-admin-background text-admin-text p-8">
      {/* Header */}
      <header className="bg-admin-card shadow-lg rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-admin-text">Reports</h1>
          </div>
          {selectedReportType && (
            <div className="flex space-x-3">
              <button
                onClick={exportToCsv}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-success text-white rounded-lg hover:bg-admin-success/80 transition-colors shadow-md"
              >
                <Download className="h-5 w-5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleBackToReports}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-secondary text-white rounded-lg hover:bg-admin-secondary/80 transition-colors shadow-md"
              >
                <FileText className="h-5 w-5" />
                <span>Back to Reports</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-500 text-white"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto mb-4"></div>
          <p className="text-admin-text">Loading report data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!selectedReportType ? (
            <motion.div
              key="report-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* General Reports Section */}
              <div>
                <h2 className="text-2xl font-bold text-admin-text mb-4">General Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generalReports.map((report) => (
                    <motion.button
                      key={report.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReportSelect(report.id)}
                      className="bg-admin-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
                    >
                      <report.icon className="h-12 w-12 text-admin-primary mb-4" />
                      <h3 className="text-xl font-bold text-admin-text mb-2">{report.name}</h3>
                      <p className="text-admin-text-light">View detailed {report.name.toLowerCase()} in tabular format.</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* GST Reports Section */}
              <div>
                <h2 className="text-2xl font-bold text-admin-text mb-4">GST Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gstReports.map((report) => (
                    <motion.button
                      key={report.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReportSelect(report.id)}
                      className="bg-admin-card rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
                    >
                      <report.icon className="h-12 w-12 text-admin-primary mb-4" />
                      <h3 className="text-xl font-bold text-admin-text mb-2">{report.name}</h3>
                      <p className="text-admin-text-light">View detailed {report.name.toLowerCase()} in tabular format.</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="report-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-admin-card rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-admin-text mb-6">
                {reportDefinitions.find(r => r.id === selectedReportType)?.name}
              </h2>
              {reportData.length === 0 ? (
                <div className="text-center py-12 text-admin-text-light">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No data available for this report.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-admin-border">
                    <thead className="bg-admin-background">
                      <tr>
                        {reportColumns.map((col) => (
                          <th
                            key={col.key}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-admin-text-light uppercase tracking-wider whitespace-nowrap"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-admin-card divide-y divide-admin-border">
                      {reportData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {reportColumns.map((col) => (
                            <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-admin-text">
                              {col.render ? col.render(row[col.key], row) : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default AdminReports;

