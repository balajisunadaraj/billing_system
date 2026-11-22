import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { ReportsIcon, PurchasesIcon, DeliveriesIcon, LayersIcon, TrashIcon, CurrencyRupeeIcon } from '../components/Icons.jsx';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    try {
      setLoading(true);
      const data = await authFetch('/reports');
      setReport(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleExport(type, format) {
    showToast({
      title: `${type} Report`,
      message: `Export to ${format} initiated.`,
      type: 'info'
    });
  }

  const statItems = [
    { label: 'Purchase Plates', value: report?.purchased_plates ?? 0, icon: PurchasesIcon, subtext: 'Total stock acquired' },
    { label: 'Delivered Plates', value: report?.delivered_plates ?? 0, icon: DeliveriesIcon, subtext: 'Dispatched to clients' },
    { label: 'Remaining Stock', value: report?.remaining_stock ?? 0, icon: LayersIcon, subtext: 'Current usable stock' },
    { label: 'Waste Plates', value: report?.waste_plates ?? 0, icon: TrashIcon, subtext: 'Defect and scrap' },
    { label: 'Total Revenue', value: `₹${Number(report?.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CurrencyRupeeIcon, subtext: 'Gross billing value' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Card with Border */}
      <div className="page-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
            Analytics & Exports
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Executive performance indicators, stock velocity, total invoiced volume, and scheduled report exports.
        </p>
      </div>

      {message && <div className="message-box message-box-error">{message}</div>}

      {/* Metric Cards with Clean Borders and Hover Effects */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statItems.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {item.label}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
                  <IconComp className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {loading ? <span className="inline-block w-14 h-6 bg-slate-100 animate-pulse rounded"></span> : item.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{item.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Export Cards with Hover Effects and Clean Borders */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((period) => (
          <div
            key={period}
            className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Statement
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                Summary
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{period} Report</h2>
            <p className="mt-1 text-xs text-slate-500">Export audited figures for this billing cycle.</p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => handleExport(period, 'PDF')}
                className="w-full btn-primary text-xs py-2"
              >
                Export PDF
              </button>
              <button
                onClick={() => handleExport(period, 'Excel')}
                className="w-full btn-secondary text-xs py-2"
              >
                Export Excel (CSV)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
