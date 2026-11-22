import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { PurchasesIcon, PlusIcon } from '../components/Icons.jsx';

const initialForm = {
  purchaseDate: new Date().toISOString().split('T')[0],
  companyId: '',
  plateType: '',
  quantityPurchased: '',
  wasteQuantity: '0',
};

export default function Purchases() {
  const [companies, setCompanies] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showPopup, showToast } = useNotification();

  const selectedCompany = companies.find((company) => company.id === Number(form.companyId));
  const availablePlateTypes = (selectedCompany?.plate_type || '').split(',').map((type) => type.trim()).filter(Boolean);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [companyRes, purchaseRes] = await Promise.all([
        authFetch('/companies'),
        authFetch('/purchases')
      ]);
      setCompanies(companyRes.companies || []);
      setPurchases(purchaseRes.purchases || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addPurchase(event) {
    event.preventDefault();
    setMessage('');

    const qty = Number(form.quantityPurchased);
    const waste = Number(form.wasteQuantity || 0);

    if (qty <= 0) {
      setMessage('Quantity purchased must be greater than 0.');
      return;
    }
    if (waste > qty) {
      setMessage('Waste quantity cannot exceed total purchased quantity.');
      return;
    }

    try {
      setLoading(true);
      await authFetch('/purchases', {
        method: 'POST',
        body: {
          purchase_date: form.purchaseDate,
          company_id: Number(form.companyId),
          plate_type: form.plateType,
          quantity_purchased: qty,
          waste_quantity: waste
        }
      });

      const netAvailable = qty - waste;
      showPopup({
        title: 'Purchase Entry Recorded!',
        message: `Successfully registered purchase of ${qty} plates for ${selectedCompany?.company_name || 'selected company'}.`,
        details: `Date: ${form.purchaseDate} • Type: ${form.plateType} • Net Stock Added: ${netAvailable} plates (Waste: ${waste})`
      });

      setForm({ ...initialForm, purchaseDate: form.purchaseDate });
      loadData();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const availableQuantity = Math.max(0, Number(form.quantityPurchased || 0) - Number(form.wasteQuantity || 0));

  return (
    <div className="space-y-6">
      {/* Header with Clean Border */}
      <div className="page-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            Inventory Inflow
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase Entry</h1>
        <p className="mt-1 text-sm text-slate-500">
          Record incoming raw material and plates received from manufacturing partners, tracking scrap and usable quantities.
        </p>
      </div>

      {message && (
        <div className="message-box message-box-error flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline font-semibold">Dismiss</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Neat & Elegant Form Card */}
        <div className="form-card">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h2 className="section-title text-base font-bold text-slate-900">New Purchase Record</h2>
            <p className="text-xs text-slate-500 mt-0.5">Specify delivery date, supplying partner, and defect counts</p>
          </div>

          <form onSubmit={addPurchase} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Purchase Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Company / Supplier <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.companyId}
                  onChange={(event) => setForm({ ...form, companyId: event.target.value, plateType: '' })}
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Plate Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.plateType}
                  onChange={(event) => setForm({ ...form, plateType: event.target.value })}
                  required
                  disabled={!form.companyId}
                >
                  <option value="">
                    {!form.companyId ? 'Select company first' : availablePlateTypes.length ? 'Select plate type' : 'No plate types configured'}
                  </option>
                  {availablePlateTypes.map((type) => (
                    <option key={type} value={type}>Type {type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Quantity Purchased <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={form.quantityPurchased}
                  onChange={(event) => setForm({ ...form, quantityPurchased: event.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Waste / Defect Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.wasteQuantity}
                  onChange={(event) => setForm({ ...form, wasteQuantity: event.target.value })}
                />
              </div>

              <div className="form-group">
                <span className="form-label">
                  Net Available Stock
                </span>
                <div className="h-[44px] flex items-center justify-between px-5 rounded-full border-2 border-slate-400 bg-slate-50/50 text-slate-900 text-sm shadow-textbox">
                  <span className="text-xs text-slate-500">Usable Plates</span>
                  <span className="font-bold text-emerald-800 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {availableQuantity}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !form.companyId}
                className="w-full btn-primary"
              >
                {loading ? 'Recording...' : '+ Save Purchase Entry'}
              </button>
            </div>
          </form>
        </div>

        {/* History Table Card */}
        <div className="page-card">
          <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="section-title text-base font-bold">Purchase Log</h2>
              <p className="text-xs text-slate-500">{purchases.length} total entries recorded</p>
            </div>
          </div>

          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th className="text-right">Purchased</th>
                  <th className="text-right">Waste</th>
                  <th className="text-right">Usable</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50/90 transition-colors">
                    <td className="text-slate-600 text-xs">{purchase.purchase_date}</td>
                    <td className="font-semibold text-slate-900">{purchase.company_name}</td>
                    <td>
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        Type {purchase.plate_type || 'N/A'}
                      </span>
                    </td>
                    <td className="text-right font-medium text-slate-800">{purchase.quantity_purchased}</td>
                    <td className="text-right text-rose-600 text-xs font-semibold">{purchase.waste_quantity || 0}</td>
                    <td className="text-right font-bold text-emerald-700">
                      {purchase.quantity_purchased - (purchase.waste_quantity || 0)}
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">
                      No purchase entries recorded yet.
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
