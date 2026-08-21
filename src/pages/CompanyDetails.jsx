import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authFetch } from '../lib/api.js';

export default function CompanyDetails() {
  const { companyId } = useParams();
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (companyId) {
      loadDetails();
    }
  }, [companyId]);

  async function loadDetails() {
    try {
      const data = await authFetch(`/companies/${companyId}/details`);
      setDetails(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="page-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Company details</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{details?.company_name || 'Loading...'}</h1>
            <p className="mt-3 text-slate-500">Full business profile, inventory trends, and billing actions for this company.</p>
          </div>
        </div>
      </div>

      {message && <div className="message-box">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="page-card">
          <h2 className="section-title">Company Summary</h2>
          <div className="space-y-4 text-sm text-slate-700">
            <p><strong>Company:</strong> {details?.company_name}</p>
            <p><strong>Contact:</strong> {details?.contact_person}</p>
            <p><strong>Phone:</strong> {details?.phone_number}</p>
            <p><strong>Email:</strong> {details?.email}</p>
            <p><strong>GST:</strong> {details?.gst_number || 'N/A'}</p>
            <p><strong>Plate Rate:</strong> ₹{details?.plate_rate?.toFixed(2) ?? '0.00'}</p>
          </div>
        </div>
        <div className="page-card">
          <h2 className="section-title">Key Metrics</h2>
          <div className="space-y-4 text-slate-700">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Purchased</p>
              <p className="mt-2 text-2xl font-semibold">{details?.total_purchased ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Delivered</p>
              <p className="mt-2 text-2xl font-semibold">{details?.total_delivered ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Remaining Stock</p>
              <p className="mt-2 text-2xl font-semibold">{details?.remaining_stock ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="page-card">
          <h2 className="section-title">Financials</h2>
          <div className="space-y-4 text-slate-700">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Waste</p>
              <p className="mt-2 text-2xl font-semibold">{details?.total_waste ?? 0}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Amount Earned</p>
              <p className="mt-2 text-2xl font-semibold">₹{details?.total_earned?.toFixed(2) ?? '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {['Purchase History', 'Delivery History', 'Generate Bill', 'Bill History'].map((label) => (
          <button key={label} className="rounded-3xl bg-slate-950 px-5 py-5 text-left text-white shadow-soft transition hover:bg-slate-800">
            <p className="text-sm font-semibold">{label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="page-card">
          <h2 className="section-title">Purchase Trend</h2>
          <div className="space-y-3">
            {details?.purchase_trend?.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div className="h-3 rounded-full bg-slate-900" style={{ width: `${Math.min(100, item.value)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="page-card">
          <h2 className="section-title">Delivery Trend</h2>
          <div className="space-y-3">
            {details?.delivery_trend?.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, item.value)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
