import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../lib/api.js';
import { CompaniesIcon, PurchasesIcon, DeliveriesIcon, BillsIcon, LayersIcon } from '../components/Icons.jsx';

export default function CompanyDetails() {
  const { companyId } = useParams();
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (companyId) {
      loadDetails();
    }
  }, [companyId]);

  async function loadDetails() {
    try {
      setLoading(true);
      const data = await authFetch(`/companies/${companyId}/details`);
      setDetails(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  let plateRatesText = 'Not configured';
  try {
    const parsed = JSON.parse(details?.plate_rates || '{}');
    const entries = Object.entries(parsed);
    if (entries.length > 0) {
      plateRatesText = entries.map(([t, r]) => `Type ${t}: ₹${Number(r).toFixed(2)}`).join(' • ');
    }
  } catch {
    plateRatesText = 'Not configured';
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="page-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate('/companies')}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium underline flex items-center gap-1"
              >
                ← Back to Companies
              </button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {details?.company_name || 'Loading Company Profile...'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Detailed account analytics, inventory flow metrics, and billing operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/purchases')}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              + Purchase
            </button>
            <button
              onClick={() => navigate('/deliveries')}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              + Delivery
            </button>
            <button
              onClick={() => navigate('/bills')}
              className="btn-primary text-xs py-2 px-3.5"
            >
              + Generate Bill
            </button>
          </div>
        </div>
      </div>

      {message && <div className="message-box message-box-error">{message}</div>}

      {/* Profile Overview & Metrics Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company Summary */}
        <div className="page-card">
          <h2 className="section-title text-base font-bold mb-4 pb-2 border-b border-slate-100">
            Account Profile
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Company Name</span>
              <span className="font-semibold text-slate-900">{details?.company_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Contact Person</span>
              <span className="font-medium text-slate-800">{details?.contact_person || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-medium text-slate-800">{details?.phone_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{details?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">GST Rate</span>
              <span className="font-medium text-slate-800">{Number(details?.gst_percentage) || 0}%</span>
            </div>
            <div className="py-1">
              <span className="text-slate-500 block mb-1">Plate Rates</span>
              <span className="text-xs font-mono bg-slate-50 text-slate-700 p-2 rounded-lg border border-slate-200 block">
                {plateRatesText}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Flow Metrics */}
        <div className="page-card">
          <h2 className="section-title text-base font-bold mb-4 pb-2 border-b border-slate-100">
            Plate Inventory Metrics
          </h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 hover:border-slate-300 transition-all">
              <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Purchased</span>
              <span className="mt-1 text-2xl font-bold text-slate-900 block">{details?.total_purchased ?? 0}</span>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 hover:border-slate-300 transition-all">
              <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Delivered</span>
              <span className="mt-1 text-2xl font-bold text-slate-900 block">{details?.total_delivered ?? 0}</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 hover:border-emerald-300 transition-all">
              <span className="text-xs uppercase tracking-wider text-emerald-700 block font-semibold">Remaining Stock</span>
              <span className="mt-1 text-2xl font-bold text-emerald-800 block">{details?.remaining_stock ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="page-card">
          <h2 className="section-title text-base font-bold mb-4 pb-2 border-b border-slate-100">
            Financial & Scrap
          </h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 hover:border-slate-300 transition-all">
              <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Waste / Scrap</span>
              <span className="mt-1 text-2xl font-bold text-rose-600 block">{details?.total_waste ?? 0} plates</span>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 hover:border-slate-300 transition-all">
              <span className="text-xs uppercase tracking-wider text-slate-500 block">Total Revenue Earned</span>
              <span className="mt-1 text-2xl font-bold text-indigo-700 block font-mono">
                ₹{Number(details?.total_earned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="page-card">
          <h2 className="section-title text-base font-bold mb-4">Purchase History Trend</h2>
          <div className="space-y-3">
            {details?.purchase_trend && details.purchase_trend.length > 0 ? (
              details.purchase_trend.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value} plates</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${Math.min(100, item.value)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No purchase trend data available</p>
            )}
          </div>
        </div>

        <div className="page-card">
          <h2 className="section-title text-base font-bold mb-4">Delivery History Trend</h2>
          <div className="space-y-3">
            {details?.delivery_trend && details.delivery_trend.length > 0 ? (
              details.delivery_trend.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value} plates</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, item.value)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No delivery trend data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
