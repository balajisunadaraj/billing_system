import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    try {
      const data = await authFetch('/reports');
      setReport(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="page-card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Reports & exports</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Analytics</h1>
          <p className="mt-3 text-slate-500">Generate daily, weekly, monthly, and yearly reports. Export to PDF or Excel from the backend.</p>
        </div>
      </div>
      {message && <div className="message-box">{message}</div>}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="page-card">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Purchase Plates</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{report?.purchased_plates ?? 0}</p>
        </div>
        <div className="page-card">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Delivered Plates</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{report?.delivered_plates ?? 0}</p>
        </div>
        <div className="page-card">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Remaining Stock</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{report?.remaining_stock ?? 0}</p>
        </div>
        <div className="page-card">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Waste Plates</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">{report?.waste_plates ?? 0}</p>
        </div>
        <div className="page-card">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Revenue</p>
          <p className="mt-4 text-4xl font-semibold text-slate-900">₹{report?.revenue?.toFixed(2) ?? '0.00'}</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period) => (
          <div key={period} className="page-card">
            <h2 className="text-lg font-semibold text-slate-900">{period} Report</h2>
            <p className="mt-3 text-slate-500">Export current result to PDF or Excel.</p>
            <div className="mt-6 flex flex-col gap-3">
              <button className="rounded-3xl bg-slate-950 px-4 py-3 text-white transition hover:bg-slate-800">Export PDF</button>
              <button className="rounded-3xl bg-slate-200 px-4 py-3 text-slate-900 transition hover:bg-slate-300">Export Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
