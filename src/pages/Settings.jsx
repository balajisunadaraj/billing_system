import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

const initialForm = {
  office_name: '',
  owner_name: '',
  phone_number: '',
  email: '',
  address: '',
  gst_percentage: '',
  company_logo_url: '',
  signature_image_url: '',
  upi_qr_url: '',
  bank_name: '',
  account_number: '',
  ifsc_code: ''
};

export default function Settings() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await authFetch('/settings');
      setForm({ ...initialForm, ...data.settings });
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    setMessage('');
    try {
      await authFetch('/settings', {
        method: 'PUT',
        body: form
      });
      setMessage('Office settings updated.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="page-card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Office Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Invoice & Company Details</h1>
        </div>
      </div>
      {message && (
        <div className={message.includes('updated') ? 'message-box message-box-success' : 'message-box message-box-error'}>
          {message}
        </div>
      )}
      <div className="page-card">
        <form onSubmit={saveSettings} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Office Name
              <input
                required
                value={form.office_name}
                onChange={(event) => setForm({ ...form, office_name: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Owner Name
              <input
                value={form.owner_name}
                onChange={(event) => setForm({ ...form, owner_name: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Phone Number
              <input
                value={form.phone_number}
                onChange={(event) => setForm({ ...form, phone_number: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Address
            <textarea
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              rows={3}
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              GST Percentage (Optional)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.gst_percentage}
                onChange={(event) => setForm({ ...form, gst_percentage: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Company Logo URL
              <input
                value={form.company_logo_url}
                onChange={(event) => setForm({ ...form, company_logo_url: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Signature Image URL
              <input
                value={form.signature_image_url}
                onChange={(event) => setForm({ ...form, signature_image_url: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              UPI QR Code URL
              <input
                value={form.upi_qr_url}
                onChange={(event) => setForm({ ...form, upi_qr_url: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Bank Name
              <input
                value={form.bank_name}
                onChange={(event) => setForm({ ...form, bank_name: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Account Number
              <input
                value={form.account_number}
                onChange={(event) => setForm({ ...form, account_number: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            IFSC Code
            <input
              value={form.ifsc_code}
              onChange={(event) => setForm({ ...form, ifsc_code: event.target.value })}
              className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
            />
          </label>
          <button type="submit" className="rounded-3xl bg-slate-950 px-6 py-3 text-white font-medium transition-all hover:bg-slate-800 active:scale-95 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
