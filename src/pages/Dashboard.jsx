import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../lib/api.js';
import {
  CompaniesIcon,
  PurchasesIcon,
  DeliveriesIcon,
  LayersIcon,
  TrashIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  PlusIcon,
  ArrowUpRightIcon
} from '../components/Icons.jsx';

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    try {
      setLoading(true);
      const data = await authFetch('/dashboard');
      setSummary(data);
      setCompanies(data.recentCompanies || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Stat cards with tasteful, balanced touches of color
  const statCards = [
    {
      key: 'totalCompanies',
      label: 'Total Companies',
      value: summary.totalCompanies ?? 0,
      subtext: 'Registered clients',
      icon: CompaniesIcon,
      topBorder: 'border-t-4 border-t-blue-500',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/70',
      tag: 'Clients',
      tagStyle: 'bg-blue-50 text-blue-700 border-blue-200/60'
    },
    {
      key: 'availableStock',
      label: 'Available Stock',
      value: summary.availableStock ?? 0,
      subtext: 'Plates ready for dispatch',
      icon: LayersIcon,
      topBorder: 'border-t-4 border-t-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/70',
      tag: 'In Stock',
      tagStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      valueColor: 'text-emerald-700'
    },
    {
      key: 'totalPurchased',
      label: 'Plates Purchased',
      value: summary.totalPurchased ?? 0,
      subtext: 'Total stock acquired',
      icon: PurchasesIcon,
      topBorder: 'border-t-4 border-t-indigo-500',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/70',
      tag: 'Inflow',
      tagStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
    },
    {
      key: 'totalDelivered',
      label: 'Plates Delivered',
      value: summary.totalDelivered ?? 0,
      subtext: 'Dispatched to clients',
      icon: DeliveriesIcon,
      topBorder: 'border-t-4 border-t-sky-500',
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/70',
      tag: 'Outflow',
      tagStyle: 'bg-sky-50 text-sky-700 border-sky-200/60'
    },
    {
      key: 'totalWaste',
      label: 'Waste / Scrap',
      value: summary.totalWaste ?? 0,
      subtext: 'Damaged or scrap material',
      icon: TrashIcon,
      topBorder: 'border-t-4 border-t-rose-400',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/70',
      tag: 'Defects',
      tagStyle: 'bg-rose-50 text-rose-700 border-rose-200/60'
    },
    {
      key: 'weeklyRevenue',
      label: 'Weekly Revenue',
      value: `₹${Number(summary.weeklyRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: 'Billed in past 7 days',
      icon: CurrencyRupeeIcon,
      topBorder: 'border-t-4 border-t-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
      tag: '7 Days',
      tagStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
      valueColor: 'text-emerald-800 font-mono'
    },
    {
      key: 'pendingBills',
      label: 'Pending Bills',
      value: summary.pendingBills ?? 0,
      subtext: 'Invoices created',
      icon: ClockIcon,
      topBorder: 'border-t-4 border-t-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/70',
      tag: 'Active',
      tagStyle: 'bg-amber-50 text-amber-700 border-amber-200/60'
    }
  ];

  // Stock utilization calculations
  const totalPurchased = Number(summary.totalPurchased || 0);
  const totalDelivered = Number(summary.totalDelivered || 0);
  const totalWaste = Number(summary.totalWaste || 0);
  const deliveredPct = totalPurchased > 0 ? Math.min(100, Math.round((totalDelivered / totalPurchased) * 100)) : 0;
  const wastePct = totalPurchased > 0 ? Math.min(100, Math.round((totalWaste / totalPurchased) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with refined gradient accent and action buttons */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 text-white shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-3 py-0.5 text-xs font-semibold text-white shadow-xs">
                Metal Plate ERP
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Inventory & Operations Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Monitor real-time plate stock levels, client deliveries, revenue generation, and pending invoices.
            </p>
          </div>

          {/* Quick Action Buttons with Crisp Borders & Color Highlights */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/purchases')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:scale-95 border border-transparent"
            >
              <PlusIcon className="w-4 h-4 text-indigo-600" />
              New Purchase
            </button>
            <button
              onClick={() => navigate('/deliveries')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-950/60 hover:border-sky-500 hover:text-sky-300 active:scale-95"
            >
              <PlusIcon className="w-4 h-4 text-sky-400" />
              New Delivery
            </button>
            <button
              onClick={() => navigate('/bills')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-950/60 hover:border-emerald-500 hover:text-emerald-300 active:scale-95"
            >
              <PlusIcon className="w-4 h-4 text-emerald-400" />
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="message-box message-box-error flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline font-semibold">Dismiss</button>
        </div>
      )}

      {/* Metrics Grid with Tasteful Color Highlights on Top Borders & Icon Containers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.key}
              className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 ${card.topBorder}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </p>
                  <p className={`mt-3 text-2xl font-bold tracking-tight ${card.valueColor || 'text-slate-900'}`}>
                    {loading ? (
                      <span className="inline-block w-16 h-7 bg-slate-100 animate-pulse rounded"></span>
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} shadow-xs`}>
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{card.subtext}</span>
                {card.tag && (
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border ${card.tagStyle}`}>
                    {card.tag}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Stock Distribution Overview with Elegant Colors */}
      <div className="page-card hover:border-indigo-200 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="section-title text-base font-bold">Plate Stock Inventory Flow</h2>
            <p className="text-xs text-slate-500">Ratio of delivered plates and scrap against total purchased</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-indigo-600"></span>
              <span>Delivered ({deliveredPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
              <span>Available Stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-rose-400"></span>
              <span>Waste ({wastePct}%)</span>
            </div>
          </div>
        </div>

        {/* Progress bar with vibrant, refined colors */}
        <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
          <div
            style={{ width: `${deliveredPct}%` }}
            className="bg-indigo-600 transition-all duration-500"
            title={`Delivered: ${totalDelivered}`}
          />
          <div
            style={{ width: `${Math.max(0, 100 - deliveredPct - wastePct)}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`In Stock: ${summary.availableStock || 0}`}
          />
          <div
            style={{ width: `${wastePct}%` }}
            className="bg-rose-400 transition-all duration-500"
            title={`Waste: ${totalWaste}`}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2 rounded-lg bg-indigo-50/40 border border-indigo-100/50">
            <span className="text-indigo-600 font-medium block">Total Inflow</span>
            <span className="font-bold text-slate-900 text-sm">{totalPurchased} plates</span>
          </div>
          <div className="p-2 rounded-lg bg-sky-50/40 border border-sky-100/50">
            <span className="text-sky-600 font-medium block">Total Outflow</span>
            <span className="font-bold text-slate-900 text-sm">{totalDelivered} plates</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/60">
            <span className="text-emerald-700 font-semibold block">Current In-Hand</span>
            <span className="font-bold text-emerald-800 text-sm">{summary.availableStock ?? 0} plates</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-50/40 border border-rose-100/50">
            <span className="text-rose-600 font-medium block">Scrap / Waste</span>
            <span className="font-bold text-rose-700 text-sm">{totalWaste} plates</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Companies & Operations Status */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Recent Companies Table */}
        <div className="page-card hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title text-base font-bold">Recent Registered Companies</h2>
              <p className="text-xs text-slate-500">Latest active corporate clients</p>
            </div>
            <button
              onClick={() => navigate('/companies')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="font-medium text-slate-900">
                      {company.company_name}
                    </td>
                    <td>{company.contact_person || 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/companies/${company.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-500 text-sm">
                      No companies added yet.{' '}
                      <button
                        onClick={() => navigate('/companies')}
                        className="text-indigo-600 font-semibold underline ml-1"
                      >
                        Add your first company
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Highlights with Color Indicators */}
        <div className="page-card hover:border-slate-300 transition-all">
          <h2 className="section-title text-base font-bold mb-4">System Notifications</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Live Inventory Validation</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deliveries check available plate stock before dispatch to prevent negative stock counts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0"></span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Direct Invoicing & PDF</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Print, download PDF, or share invoices directly via WhatsApp and Email from the Billing tab.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0"></span>
              <div>
                <p className="text-xs font-semibold text-slate-900">PostgreSQL Database</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  All transaction records, purchases, and deliveries are safely synchronized with Supabase backend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
