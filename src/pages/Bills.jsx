import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { authFetch } from '../lib/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { BillsIcon, CurrencyRupeeIcon } from '../components/Icons.jsx';

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
  const [loading, setLoading] = useState(false);
  const { showPopup, showToast } = useNotification();

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
      setLoading(true);
      const res = await authFetch('/bills', {
        method: 'POST',
        body: {
          company_id: Number(form.companyId),
          delivery_id: Number(form.deliveryId),
          customer_gst: form.customerGst,
          gst_percentage: Number(form.gstPercentage)
        }
      });

      const invNo = res?.bill?.invoice_number || 'New Invoice';
      showPopup({
        title: 'Bill Generated Successfully!',
        message: `Invoice ${invNo} generated for ${selectedCompany?.company_name || 'client'}.`,
        details: `Plates: ${selectedDelivery.quantity_delivered} (Type ${selectedDelivery.plate_type}) • Rate: ₹${ratePerPlate.toFixed(2)} • Subtotal: ₹${subtotal.toFixed(2)} • Grand Total: ₹${grandTotal.toFixed(2)}`
      });

      setForm(initialForm);
      loadData();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
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
    doc.text(`GST: ${settings?.gst_percentage ? Number(settings.gst_percentage) + '%' : 'N/A'}`, left, y);

    y += 32;
    doc.setFontSize(14);
    doc.text('TAX INVOICE', left, y);
    doc.setFontSize(11);
    y += 24;
    doc.text(`Invoice Number: ${bill.invoice_number}`, left, y);
    y += 16;
    doc.text(`Billing Date: ${bill.billing_date}`, left, y);
    y += 16;
    doc.text(`Customer GST: ${bill.customer_gst || 'N/A'}`, left, y);

    y += 32;
    doc.setFontSize(12);
    doc.text('Invoice Line Items', left, y);
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
    doc.text('Authorized Signatory', left, y);
    doc.text(`Contact: +91 8270070097`, left, y + 20);

    return doc;
  }

  function downloadInvoice(bill) {
    const doc = createInvoicePdf(bill);
    doc.save(`${bill.invoice_number}.pdf`);
    showToast({ title: 'Download Started', message: `Saved ${bill.invoice_number}.pdf`, type: 'info' });
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
    <div className="space-y-6">
      {/* Header Card */}
      <div className="page-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            Financials
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Invoice Generator</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate official tax invoices for unbilled deliveries, calculate GST, export PDF invoices, or share via WhatsApp and Email.
        </p>
      </div>

      {message && (
        <div className="message-box message-box-error flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline font-semibold">Dismiss</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* Neat & Elegant Invoice Generator Form Card */}
        <div className="form-card">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h2 className="section-title text-base font-bold text-slate-900">Generate New Bill</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select unbilled delivery batch and apply tax terms</p>
          </div>

          <form onSubmit={createBill} className="space-y-4">
            <div className="form-group">
              <label className="form-label">
                Client Company <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.companyId}
                onChange={(event) => setForm({ ...form, companyId: event.target.value, deliveryId: '' })}
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Unbilled Delivery Dispatch <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.deliveryId}
                disabled={!form.companyId || availableDeliveries.length === 0}
                onChange={(event) => setForm({ ...form, deliveryId: event.target.value })}
                className="disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!form.companyId ? 'Select a company first' : availableDeliveries.length ? 'Select a delivery record' : 'No unbilled deliveries for this company'}
                </option>
                {availableDeliveries.map((delivery) => (
                  <option key={delivery.id} value={delivery.id}>
                    {delivery.delivery_date} — Plate Type {delivery.plate_type} ({delivery.quantity_delivered} plates)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Delivery Details Preview with Crisp Card */}
            {selectedDelivery && (
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/70 pb-2">
                  <span>Batch Summary</span>
                  <span>Configured Rate</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Type {selectedDelivery.plate_type || 'N/A'} • {selectedDelivery.quantity_delivered} Plates
                    </p>
                    <p className="text-xs text-slate-500">Delivered on {selectedDelivery.delivery_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {rateConfigured ? `₹${ratePerPlate.toFixed(2)} / plate` : 'Rate Not Configured'}
                    </p>
                  </div>
                </div>

                {!rateConfigured && (
                  <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    Warning: Configure this plate type price in Company Settings before invoicing.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Customer GST Number
                </label>
                <input
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={form.customerGst}
                  onChange={(event) => setForm({ ...form, customerGst: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  GST Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 18"
                  value={form.gstPercentage}
                  onChange={(event) => setForm({ ...form, gstPercentage: event.target.value })}
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({selectedDelivery?.quantity_delivered || 0} × ₹{ratePerPlate.toFixed(2)})</span>
                <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>GST Tax ({Number(form.gstPercentage) || 0}%)</span>
                <span className="font-medium text-slate-900">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-slate-900 font-mono text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !selectedDelivery || !rateConfigured}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : '+ Generate & Record Bill'}
              </button>
            </div>
          </form>
        </div>

        {/* Invoice History Card */}
        <div className="page-card">
          <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="section-title text-base font-bold">Invoice History</h2>
              <p className="text-xs text-slate-500">{bills.length} invoices generated</p>
            </div>
          </div>

          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Plate Type</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/90 transition-colors">
                    <td>
                      <span className="font-bold text-slate-900">{bill.invoice_number}</span>
                      <span className="block text-xs text-slate-500">{bill.company_name}</span>
                    </td>
                    <td className="text-xs text-slate-600">{bill.billing_date}</td>
                    <td>
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        Type {bill.plate_type || 'N/A'}
                      </span>
                    </td>
                    <td className="text-right font-medium">{bill.quantity_delivered}</td>
                    <td className="text-right font-bold text-slate-900 font-mono">
                      ₹{Number(bill.grand_total).toFixed(2)}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => downloadInvoice(bill)}
                          title="Download PDF"
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => printInvoice(bill)}
                          title="Print Invoice"
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          Print
                        </button>
                        <button
                          type="button"
                          onClick={() => shareInvoiceWhatsApp(bill)}
                          title="Share via WhatsApp"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
                        >
                          WA
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">
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
