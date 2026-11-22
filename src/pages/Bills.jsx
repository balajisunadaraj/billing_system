import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { authFetch } from '../lib/api.js';

const OFFICE_WHATSAPP = '918270070097';
const initialForm = {
  companyId: '',
  deliveryId: '',
  customerGst: '',
  gstPercentage: ''
};

export default function Bills() {
  const [companies, setCompanies] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const selectedCompany = companies.find((company) => company.id === Number(form.companyId));
  const availableDeliveries = deliveries.filter((delivery) =>
    Number(delivery.company_id) === Number(form.companyId) &&
    !bills.some((bill) => Number(bill.delivery_id) === Number(delivery.id))
  );
  const selectedDelivery = availableDeliveries.find((delivery) => Number(delivery.id) === Number(form.deliveryId));
  let plateRates = {};
  try {
    plateRates = JSON.parse(selectedCompany?.plate_rates || '{}');
  } catch {
    plateRates = {};
  }
  const ratePerPlate = selectedDelivery
    ? Number(plateRates[selectedDelivery.plate_type] ?? selectedCompany?.plate_rate ?? 0)
    : 0;
  const rateConfigured = selectedDelivery && (
    Object.prototype.hasOwnProperty.call(plateRates, selectedDelivery.plate_type) ||
    Number(selectedCompany?.plate_rate) > 0
  ) && Number.isFinite(ratePerPlate) && ratePerPlate >= 0;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [companyRes, deliveryRes, billRes, settingsRes] = await Promise.all([
        authFetch('/companies'),
        authFetch('/deliveries'),
        authFetch('/bills'),
        authFetch('/settings')
      ]);
      setCompanies(companyRes.companies || []);
      setDeliveries(deliveryRes.deliveries || []);
      setBills(billRes.bills || []);
      setSettings(settingsRes.settings || {});
    } catch (error) {
      setMessage(error.message);
    }
  }

  const subtotal = Number(selectedDelivery?.quantity_delivered || 0) * ratePerPlate;
  const gstAmount = subtotal * (Number(form.gstPercentage) || 0) / 100;
  const grandTotal = subtotal + gstAmount;

  async function createBill(event) {
    event.preventDefault();
    setMessage('');

    try {
      await authFetch('/bills', {
        method: 'POST',
        body: {
          company_id: Number(form.companyId),
          delivery_id: Number(form.deliveryId),
          customer_gst: form.customerGst,
          gst_percentage: Number(form.gstPercentage)
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
    doc.text(`GST Percentage: ${Number(settings?.gst_percentage) || 0}%`, left, y);

    y += 32;
    doc.setFontSize(14);
    doc.text('Invoice', left, y);
    doc.setFontSize(11);
    y += 24;
    doc.text(`Invoice Number: ${bill.invoice_number}`, left, y);
    y += 16;
    doc.text(`Billing Date: ${bill.billing_date}`, left, y);
    y += 16;
    doc.text(`Customer GST: ${bill.customer_gst || 'N/A'}`, left, y);

    y += 32;
    doc.setFontSize(12);
    doc.text('Invoice Items', left, y);
    const tableX = left;
    const tableWidth = 515;
    const headerY = y + 12;
    const headerHeight = 26;
    const rowHeight = 30;
    const quantityX = tableX + 385;
    const rateX = tableX + 455;
    const amountX = tableX + tableWidth - 10;

    doc.setFillColor(15, 23, 42);
    doc.rect(tableX, headerY, tableWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Description', tableX + 10, headerY + 17);
    doc.text('Qty', quantityX, headerY + 17, { align: 'right' });
    doc.text('Rate', rateX, headerY + 17, { align: 'right' });
    doc.text('Amount', amountX, headerY + 17, { align: 'right' });

    const itemY = headerY + headerHeight;
    doc.setTextColor(30, 41, 59);
    doc.setDrawColor(203, 213, 225);
    doc.rect(tableX, itemY, tableWidth, rowHeight);
    doc.text(`Plate ${bill.plate_type || 'N/A'} - ${bill.billing_date}`, tableX + 10, itemY + 19);
    doc.text(String(bill.quantity_delivered), quantityX, itemY + 19, { align: 'right' });
    doc.text(`₹${Number(bill.rate_per_plate).toFixed(2)}`, rateX, itemY + 19, { align: 'right' });
    doc.text(`₹${Number(bill.subtotal).toFixed(2)}`, amountX, itemY + 19, { align: 'right' });

    let totalsY = itemY + rowHeight;
    const totalsX = tableX + 310;
    const totalsWidth = tableWidth - 310;
    const totalRows = [
      ['Subtotal', Number(bill.subtotal)],
      [`GST (${Number(bill.gst_percentage)}%)`, Number(bill.gst_amount)],
      ['Grand Total', Number(bill.grand_total)]
    ];
    totalRows.forEach(([label, value], index) => {
      const isGrandTotal = index === totalRows.length - 1;
      if (isGrandTotal) {
        doc.setFillColor(241, 245, 249);
        doc.rect(totalsX, totalsY, totalsWidth, 25, 'F');
      }
      doc.setDrawColor(203, 213, 225);
      doc.line(totalsX, totalsY + 25, totalsX + totalsWidth, totalsY + 25);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', isGrandTotal ? 'bold' : 'normal');
      doc.text(label, totalsX + 8, totalsY + 16);
      doc.text(`₹${value.toFixed(2)}`, totalsX + totalsWidth - 8, totalsY + 16, { align: 'right' });
      totalsY += 25;
    });

    y = totalsY + 36;
    doc.setFont('helvetica', 'normal');
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
      `Invoice ${bill.invoice_number}%0ACompany: ${bill.company_name}%0APlate Type: ${bill.plate_type || 'N/A'}%0AAmount: ₹${Number(bill.grand_total).toFixed(2)}%0ADate: ${bill.billing_date}%0AContact: +91 8270070097`
    );
    window.open(`https://wa.me/${OFFICE_WHATSAPP}?text=${text}`, '_blank');
  }

  function shareInvoiceEmail(bill) {
    const subject = encodeURIComponent(`Invoice ${bill.invoice_number}`);
    const body = encodeURIComponent(
      `Please find the invoice details below:\nInvoice Number: ${bill.invoice_number}\nBilling Date: ${bill.billing_date}\nPlate Type: ${bill.plate_type || 'N/A'}\nAmount: ₹${Number(bill.grand_total).toFixed(2)}\n\nThank you.\nContact: +91 8270070097`
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
      {message && (
        <div className={message.includes('generated') ? 'message-box message-box-success' : 'message-box message-box-error'}>
          {message}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="page-card">
          <form onSubmit={createBill} className="grid gap-5">
            <label className="block text-sm font-medium text-slate-700">
              Company
              <select
                required
                value={form.companyId}
                onChange={(event) => setForm({ ...form, companyId: event.target.value, deliveryId: '' })}
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
              Delivered Record
              <select
                required
                value={form.deliveryId}
                disabled={!form.companyId || availableDeliveries.length === 0}
                onChange={(event) => setForm({ ...form, deliveryId: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500 disabled:opacity-60"
              >
                <option value="">
                  {!form.companyId ? 'Select a company first' : availableDeliveries.length ? 'Select a delivery' : 'No unbilled deliveries'}
                </option>
                {availableDeliveries.map((delivery) => (
                  <option key={delivery.id} value={delivery.id}>
                    {delivery.delivery_date} | Plate {delivery.plate_type} | {delivery.quantity_delivered} plates
                  </option>
                ))}
              </select>
            </label>
            {selectedDelivery && (
              <div className="table-panel">
                <table className="min-w-[620px]">
                  <thead>
                    <tr>
                      <th>Delivery Date</th>
                      <th>Plate Type</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Rate</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{selectedDelivery.delivery_date}</td>
                      <td>{selectedDelivery.plate_type || 'Not set'}</td>
                      <td className="text-right">{selectedDelivery.quantity_delivered}</td>
                      <td className="text-right">{rateConfigured ? `₹${ratePerPlate.toFixed(2)}` : 'Not configured'}</td>
                      <td className="text-right font-semibold">₹{subtotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                {!rateConfigured && (
                  <p className="px-5 py-3 text-sm text-rose-700">Set this plate type's price in the company entry before invoicing.</p>
                )}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Customer GST
                <input
                  value={form.customerGst}
                  onChange={(event) => setForm({ ...form, customerGst: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              GST Percentage (Optional)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.gstPercentage}
                onChange={(event) => setForm({ ...form, gstPercentage: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <div className="table-panel">
              <table>
                <tbody>
                  <tr>
                    <th>Subtotal</th>
                    <td className="text-right">₹{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <th>GST ({Number(form.gstPercentage) || 0}%)</th>
                    <td className="text-right">₹{gstAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="font-semibold">
                    <th>Grand Total</th>
                    <td className="text-right font-semibold">₹{grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="submit" disabled={!selectedDelivery || !rateConfigured} className="rounded-3xl bg-slate-950 px-6 py-3 text-white font-medium transition-all hover:bg-slate-800 active:scale-95 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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
                  <th>Plate Type</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-200 last:border-none">
                    <td>{bill.invoice_number}</td>
                    <td>{bill.billing_date}</td>
                    <td>{bill.plate_type || 'Not set'}</td>
                    <td className="text-right">{bill.quantity_delivered}</td>
                    <td className="text-right">₹{Number(bill.rate_per_plate).toFixed(2)}</td>
                    <td className="text-right">₹{Number(bill.grand_total).toFixed(2)}</td>
                    <td className="space-x-2 py-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => downloadInvoice(bill)}
                        className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => printInvoice(bill)}
                        className="rounded-2xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-600 active:scale-95"
                      >
                        Print
                      </button>
                      <button
                        type="button"
                        onClick={() => shareInvoiceWhatsApp(bill)}
                        className="rounded-2xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-600 active:scale-95"
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => shareInvoiceEmail(bill)}
                        className="rounded-2xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-sky-600 active:scale-95"
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-slate-500">
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
