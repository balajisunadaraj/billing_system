import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { authFetch } from '../lib/api.js';

const OFFICE_WHATSAPP = '918270070097';
const initialForm = {
  companyId: '',
  customerName: '',
  customerGst: '',
  billingDate: '',
  quantityDelivered: '',
  ratePerPlate: '',
  gstEnabled: false,
  gstPercentage: 18
};

export default function Bills() {
  const [companies, setCompanies] = useState([]);
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [companyRes, billRes, settingsRes] = await Promise.all([
        authFetch('/companies'),
        authFetch('/bills'),
        authFetch('/settings')
      ]);
      setCompanies(companyRes.companies || []);
      setBills(billRes.bills || []);
      setSettings(settingsRes.settings || {});
    } catch (error) {
      setMessage(error.message);
    }
  }

  const subtotal = (Number(form.quantityDelivered) || 0) * (Number(form.ratePerPlate) || 0);
  const gstAmount = form.gstEnabled ? subtotal * (Number(form.gstPercentage) || 0) / 100 : 0;
  const grandTotal = subtotal + gstAmount;

  async function createBill(event) {
    event.preventDefault();
    setMessage('');

    try {
      await authFetch('/bills', {
        method: 'POST',
        body: {
          company_id: Number(form.companyId),
          customer_name: form.customerName,
          customer_gst: form.customerGst,
          billing_date: form.billingDate,
          quantity_delivered: Number(form.quantityDelivered),
          rate_per_plate: Number(form.ratePerPlate),
          gst_applicable: form.gstEnabled,
          gst_percentage: Number(form.gstPercentage),
          gst_amount: gstAmount,
          subtotal,
          grand_total: grandTotal
        }
      });
      setMessage('Invoice generated.');
      setForm(initialForm);
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function createInvoicePdf(bill) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const left = 40;
    let y = 40;

    doc.setFontSize(20);
    doc.text(settings?.office_name || 'Metal Plate Co.', left, y);
    doc.setFontSize(11);
    y += 24;
    doc.text(settings?.address || 'Office Address', left, y);
    y += 16;
    doc.text(`Phone: ${settings?.phone_number || '8270070097'}`, left, y);
    y += 16;
    doc.text(`Email: ${settings?.email || 'office@example.com'}`, left, y);
    y += 16;
    doc.text(`GST: ${settings?.gst_number || 'GST000000'}`, left, y);

    y += 32;
    doc.setFontSize(14);
    doc.text('Invoice', left, y);
    doc.setFontSize(11);
    y += 24;
    doc.text(`Invoice Number: ${bill.invoice_number}`, left, y);
    y += 16;
    doc.text(`Billing Date: ${bill.billing_date}`, left, y);
    y += 16;
    doc.text(`Customer Name: ${bill.customer_name}`, left, y);
    y += 16;
    doc.text(`Customer GST: ${bill.customer_gst || 'N/A'}`, left, y);

    y += 32;
    doc.setFontSize(12);
    doc.text('Invoice Summary', left, y);
    y += 20;
    doc.text(`Delivered Quantity: ${bill.quantity_delivered}`, left, y);
    y += 16;
    doc.text(`Rate Per Plate: ₹${Number(bill.rate_per_plate).toFixed(2)}`, left, y);
    y += 16;
    doc.text(`Subtotal: ₹${Number(bill.subtotal).toFixed(2)}`, left, y);
    if (bill.gst_applicable) {
      y += 16;
      doc.text(`GST (${bill.gst_percentage}%): ₹${Number(bill.gst_amount).toFixed(2)}`, left, y);
    }
    y += 16;
    doc.text(`Grand Total: ₹${Number(bill.grand_total).toFixed(2)}`, left, y);

    y += 32;
    doc.text('Authorized Signature', left, y);
    doc.text(`Contact WhatsApp: +91 8270070097`, left, y + 20);

    return doc;
  }

  function downloadInvoice(bill) {
    const doc = createInvoicePdf(bill);
    doc.save(`${bill.invoice_number}.pdf`);
  }

  function printInvoice(bill) {
    const doc = createInvoicePdf(bill);
    const url = doc.output('bloburl');
    window.open(url, '_blank');
  }

  function shareInvoiceWhatsApp(bill) {
    const text = encodeURIComponent(
      `Invoice ${bill.invoice_number}%0ACompany: ${bill.company_name}%0ACustomer: ${bill.customer_name}%0AAmount: ₹${Number(bill.grand_total).toFixed(2)}%0ADate: ${bill.billing_date}%0AContact: +91 8270070097`
    );
    window.open(`https://wa.me/${OFFICE_WHATSAPP}?text=${text}`, '_blank');
  }

  function shareInvoiceEmail(bill) {
    const subject = encodeURIComponent(`Invoice ${bill.invoice_number}`);
    const body = encodeURIComponent(
      `Dear ${bill.customer_name},\n\nPlease find the invoice details below:\nInvoice Number: ${bill.invoice_number}\nBilling Date: ${bill.billing_date}\nAmount: ₹${Number(bill.grand_total).toFixed(2)}\n\nThank you.\nContact: +91 8270070097`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="space-y-8">
      <div className="page-card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Billing Module</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Generate Invoice</h1>
        </div>
      </div>
      {message && <div className="message-box">{message}</div>}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="page-card">
          <form onSubmit={createBill} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Company
                <select
                  required
                  value={form.companyId}
                  onChange={(event) => setForm({ ...form, companyId: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Billing Date
                <input
                  type="date"
                  required
                  value={form.billingDate}
                  onChange={(event) => setForm({ ...form, billingDate: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Customer Name
                <input
                  required
                  value={form.customerName}
                  onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Customer GST
                <input
                  value={form.customerGst}
                  onChange={(event) => setForm({ ...form, customerGst: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Quantity Delivered
                <input
                  type="number"
                  required
                  value={form.quantityDelivered}
                  onChange={(event) => setForm({ ...form, quantityDelivered: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Rate Per Plate
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.ratePerPlate}
                  onChange={(event) => setForm({ ...form, ratePerPlate: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.gstEnabled}
                onChange={(event) => setForm({ ...form, gstEnabled: event.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-500"
              />
              Apply GST
            </label>
            {form.gstEnabled && (
              <label className="block text-sm font-medium text-slate-700">
                GST Percentage
                <input
                  type="number"
                  value={form.gstPercentage}
                  onChange={(event) => setForm({ ...form, gstPercentage: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            )}
            <div className="space-y-3 rounded-3xl bg-slate-50 p-5 text-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <strong>₹{subtotal.toFixed(2)}</strong>
              </div>
              {form.gstEnabled && (
                <div className="flex items-center justify-between text-sm">
                  <span>GST Amount</span>
                  <strong>₹{gstAmount.toFixed(2)}</strong>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Grand Total</span>
                <strong>₹{grandTotal.toFixed(2)}</strong>
              </div>
            </div>
            <button type="submit" className="rounded-3xl bg-slate-950 px-6 py-3 text-white transition hover:bg-slate-800">
              Create Invoice
            </button>
          </form>
        </div>

        <div className="page-card">
          <h2 className="section-title">Invoice History</h2>
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th className="text-right">Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-200 last:border-none">
                    <td>{bill.invoice_number}</td>
                    <td>{bill.billing_date}</td>
                    <td>{bill.customer_name}</td>
                    <td className="text-right">₹{bill.grand_total?.toFixed(2)}</td>
                    <td className="space-x-2 py-4">
                      <button
                        type="button"
                        onClick={() => downloadInvoice(bill)}
                        className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => printInvoice(bill)}
                        className="rounded-2xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-600"
                      >
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() => shareInvoiceWhatsApp(bill)}
                        className="rounded-2xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => shareInvoiceEmail(bill)}
                        className="rounded-2xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600"
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-500">
                      No invoices created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
