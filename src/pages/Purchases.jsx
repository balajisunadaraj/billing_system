import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

const initialForm = {
  purchaseDate: '',
  companyId: '',
  plateType: '',
  quantityPurchased: '',
  wasteQuantity: '',
  notes: ''
};

export default function Purchases() {
  const [companies, setCompanies] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [companyRes, purchaseRes] = await Promise.all([authFetch('/companies'), authFetch('/purchases')]);
      setCompanies(companyRes.companies || []);
      setPurchases(purchaseRes.purchases || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addPurchase(event) {
    event.preventDefault();
    setMessage('');

    try {
      await authFetch('/purchases', {
        method: 'POST',
        body: {
          purchase_date: form.purchaseDate,
          company_id: Number(form.companyId),
          plate_type: form.plateType,
          quantity_purchased: Number(form.quantityPurchased),
          waste_quantity: Number(form.wasteQuantity),
          notes: form.notes
        }
      });
      setMessage('Purchase entry saved.');
      setForm(initialForm);
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="page-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Purchase Entry</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">New Purchase</h1>
          </div>
        </div>
      </div>
      {message && <div className="message-box">{message}</div>}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="page-card">
          <form onSubmit={addPurchase} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Purchase Date
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(event) => setForm({ ...form, purchaseDate: event.target.value })}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Plate Type
                <input
                  value={form.plateType}
                  onChange={(event) => setForm({ ...form, plateType: event.target.value })}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Quantity Purchased
                <input
                  type="number"
                  value={form.quantityPurchased}
                  onChange={(event) => setForm({ ...form, quantityPurchased: event.target.value })}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Waste Quantity
                <input
                  type="number"
                  value={form.wasteQuantity}
                  onChange={(event) => setForm({ ...form, wasteQuantity: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <div className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Available Quantity</span>
                <div className="mt-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
                  {Math.max(0, Number(form.quantityPurchased) - Number(form.wasteQuantity || 0))}
                </div>
              </div>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                rows={4}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <button type="submit" className="rounded-3xl bg-slate-950 px-6 py-3 text-white transition hover:bg-slate-800">
              Save Purchase
            </button>
          </form>
        </div>

        <div className="page-card">
          <h2 className="section-title">Purchase History</h2>
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Purchased</th>
                  <th>Waste</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-slate-200 last:border-none">
                    <td>{purchase.purchase_date}</td>
                    <td>{purchase.company_name}</td>
                    <td>{purchase.quantity_purchased}</td>
                    <td>{purchase.waste_quantity}</td>
                    <td>{purchase.quantity_purchased - purchase.waste_quantity}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-500">
                      No purchase records yet.
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
