import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { DeliveriesIcon, PlusIcon } from '../components/Icons.jsx';

const initialForm = {
  deliveryDate: new Date().toISOString().split('T')[0],
  companyId: '',
  quantityDelivered: '',
  plateType: ''
};

export default function Deliveries() {
  const [companies, setCompanies] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
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
      const [companyRes, deliveryRes] = await Promise.all([
        authFetch('/companies'),
        authFetch('/deliveries')
      ]);
      setCompanies(companyRes.companies || []);
      setDeliveries(deliveryRes.deliveries || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addDelivery(event) {
    event.preventDefault();
    setMessage('');

    const qty = Number(form.quantityDelivered);
    if (qty <= 0) {
      setMessage('Quantity delivered must be greater than 0.');
      return;
    }

    try {
      setLoading(true);
      await authFetch('/deliveries', {
        method: 'POST',
        body: {
          delivery_date: form.deliveryDate,
          company_id: Number(form.companyId),
          quantity_delivered: qty,
          plate_type: form.plateType
        }
      });

      showPopup({
        title: 'Delivery Entry Recorded!',
        message: `Successfully dispatched ${qty} plates to ${selectedCompany?.company_name || 'client'}.`,
        details: `Date: ${form.deliveryDate} • Plate Type: ${form.plateType} • Dispatched: ${qty} plates`
      });

      setForm({ ...initialForm, deliveryDate: form.deliveryDate });
      loadData();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card with Clean Border */}
      <div className="page-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            Logistics & Outflow
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Entry</h1>
        <p className="mt-1 text-sm text-slate-500">
          Record dispatches to client companies. Dispatches are automatically prepared for subsequent invoice billing.
        </p>
      </div>

      {message && (
        <div className="message-box message-box-error flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline font-semibold">Dismiss</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Delivery Form Card */}
        <div className="page-card">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h2 className="section-title text-lg font-bold">New Delivery Record</h2>
            <p className="text-xs text-slate-500">Specify delivery date, client company, and plate count</p>
          </div>

          <form onSubmit={addDelivery} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Delivery Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(event) => setForm({ ...form, deliveryDate: event.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Client Company <span className="text-rose-500">*</span>
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Plate Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.plateType}
                  onChange={(event) => setForm({ ...form, plateType: event.target.value })}
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Quantity Delivered <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 250"
                  value={form.quantityDelivered}
                  onChange={(event) => setForm({ ...form, quantityDelivered: event.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !form.companyId}
                className="w-full btn-primary"
              >
                {loading ? 'Recording...' : '+ Record Delivery'}
              </button>
            </div>
          </form>
        </div>

        {/* History Table Card with Row Hover Effects & Borders */}
        <div className="page-card">
          <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="section-title text-lg font-bold">Delivery Log</h2>
              <p className="text-xs text-slate-500">{deliveries.length} total dispatches recorded</p>
            </div>
          </div>

          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Plate Type</th>
                  <th className="text-right">Delivered</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                    <td className="text-slate-600 text-xs">{delivery.delivery_date}</td>
                    <td className="font-medium text-slate-900">{delivery.company_name}</td>
                    <td>
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        Type {delivery.plate_type || 'N/A'}
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-900">{delivery.quantity_delivered}</td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">
                      No deliveries recorded yet.
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
