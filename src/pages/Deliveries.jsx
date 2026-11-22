import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

const initialForm = {
  deliveryDate: '',
  companyId: '',
  quantityDelivered: '',
  plateType: ''
};

export default function Deliveries() {
  const [companies, setCompanies] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const selectedCompany = companies.find((company) => company.id === Number(form.companyId));
  const availablePlateTypes = (selectedCompany?.plate_type || '').split(',').map((type) => type.trim()).filter(Boolean);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [companyRes, deliveryRes] = await Promise.all([authFetch('/companies'), authFetch('/deliveries')]);
      setCompanies(companyRes.companies || []);
      setDeliveries(deliveryRes.deliveries || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addDelivery(event) {
    event.preventDefault();
    setMessage('');

    try {
      await authFetch('/deliveries', {
        method: 'POST',
        body: {
          delivery_date: form.deliveryDate,
          company_id: Number(form.companyId),
          quantity_delivered: Number(form.quantityDelivered),
          plate_type: form.plateType
        }
      });
      setMessage('Delivery recorded successfully.');
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
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Delivery Entry</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">New Delivery</h1>
          </div>
        </div>
      </div>
      {message && (
        <div className={message.includes('recorded') ? 'message-box message-box-success' : 'message-box message-box-error'}>
          {message}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="page-card">
          <form onSubmit={addDelivery} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Delivery Date
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(event) => setForm({ ...form, deliveryDate: event.target.value })}
                  required
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Company
                <select
                  required
                  value={form.companyId}
                  onChange={(event) => setForm({ ...form, companyId: event.target.value, plateType: '' })}
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
            <label className="block text-sm font-medium text-slate-700">
              Plate Type
              <select
                required
                value={form.plateType}
                onChange={(event) => setForm({ ...form, plateType: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              >
                <option value="">Select plate type</option>
                {availablePlateTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Quantity Delivered
              <input
                type="number"
                value={form.quantityDelivered}
                onChange={(event) => setForm({ ...form, quantityDelivered: event.target.value })}
                required
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <button type="submit" className="rounded-3xl bg-slate-950 px-6 py-3 text-white font-medium transition-all hover:bg-slate-800 active:scale-95 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
              Save Delivery
            </button>
          </form>
        </div>

        <div className="page-card">
          <h2 className="section-title">Delivery History</h2>
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Plate Type</th>
                  <th>Delivered</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-slate-200 last:border-none">
                    <td>{delivery.delivery_date}</td>
                    <td>{delivery.company_name}</td>
                    <td>{delivery.plate_type || 'Not set'}</td>
                    <td>{delivery.quantity_delivered}</td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500">
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
