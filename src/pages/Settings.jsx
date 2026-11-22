import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { SettingsIcon } from '../components/Icons.jsx';

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
  const [loading, setLoading] = useState(false);
  const { showPopup, showToast } = useNotification();

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
      setLoading(true);
      await authFetch('/settings', {
        method: 'PUT',
        body: form
      });
      showPopup({
        title: 'Settings Saved Successfully!',
        message: 'Your official office credentials, banking details, and invoice branding were updated.',
        details: `Office: ${form.office_name || 'N/A'} • Owner: ${form.owner_name || 'N/A'} • GST: ${form.gst_percentage || 0}%`
      });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="page-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            System Preferences
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Office & Billing Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure office identity, header address, banking details, default GST rate, and digital signatures for PDF invoices.
        </p>
      </div>

      {message && (
        <div className="message-box message-box-error flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline font-semibold">Dismiss</button>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="form-card">
        <form onSubmit={saveSettings} className="space-y-6">
          {/* Section 1: Business Identity */}
          <div className="form-section">
            <div className="form-section-title">
              <span>1. Business & Contact Information</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">Primary Office Identity</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Office / Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. Precision Metal Plates Ltd."
                  value={form.office_name}
                  onChange={(event) => setForm({ ...form, office_name: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Proprietor / Owner Name
                </label>
                <input
                  placeholder="e.g. Balaji S."
                  value={form.owner_name}
                  onChange={(event) => setForm({ ...form, owner_name: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Official Phone Number
                </label>
                <input
                  placeholder="e.g. +91 82700 70097"
                  value={form.phone_number}
                  onChange={(event) => setForm({ ...form, phone_number: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Official Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. billing@metalplates.in"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Office Registered Address
              </label>
              <textarea
                rows={2}
                placeholder="Full street address, city, state, postal code"
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Tax & Assets */}
          <div className="form-section">
            <div className="form-section-title">
              <span>2. Taxation & Invoice Branding</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">PDF & Receipt Headers</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Default GST Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 18"
                  value={form.gst_percentage}
                  onChange={(event) => setForm({ ...form, gst_percentage: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Company Logo URL <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  placeholder="https://..."
                  value={form.company_logo_url}
                  onChange={(event) => setForm({ ...form, company_logo_url: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Authorized Signature URL <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  placeholder="https://..."
                  value={form.signature_image_url}
                  onChange={(event) => setForm({ ...form, signature_image_url: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  UPI Payment QR Code URL <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
                <input
                  placeholder="https://..."
                  value={form.upi_qr_url}
                  onChange={(event) => setForm({ ...form, upi_qr_url: event.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank Details */}
          <div className="form-section">
            <div className="form-section-title">
              <span>3. Bank Details for Invoice Settlement</span>
              <span className="text-[11px] font-normal text-slate-400 normal-case">Wire & NEFT Information</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="form-group">
                <label className="form-label">
                  Bank Name
                </label>
                <input
                  placeholder="e.g. State Bank of India"
                  value={form.bank_name}
                  onChange={(event) => setForm({ ...form, bank_name: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Account Number
                </label>
                <input
                  placeholder="e.g. 123456789012"
                  value={form.account_number}
                  onChange={(event) => setForm({ ...form, account_number: event.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  IFSC Code
                </label>
                <input
                  placeholder="e.g. SBIN0001234"
                  value={form.ifsc_code}
                  onChange={(event) => setForm({ ...form, ifsc_code: event.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[200px]"
            >
              {loading ? 'Saving Changes...' : 'Save Office Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
