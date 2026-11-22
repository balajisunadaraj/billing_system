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

  const statCards = [
    {
      key: 'totalCompanies',
      label: 'Total Companies',
      value: summary.totalCompanies ?? 0,
      subtext: 'Registered clients',
      icon: CompaniesIcon,
      accent: 'border-slate-200 hover:border-slate-400'
    },
    {
      key: 'availableStock',
      label: 'Available Stock',
      value: summary.availableStock ?? 0,
      subtext: 'Plates ready for dispatch',
      icon: LayersIcon,
      badge: 'In Stock',
      accent: 'border-slate-200 hover:border-emerald-300'
    },
    {
      key: 'totalPurchased',
      label: 'Plates Purchased',
      value: summary.totalPurchased ?? 0,
      subtext: 'Total stock acquired',
      icon: PurchasesIcon,
      accent: 'border-slate-200 hover:border-slate-400'
    },
    {
      key: 'totalDelivered',
      label: 'Plates Delivered',
      value: summary.totalDelivered ?? 0,
      subtext: 'Dispatched to clients',
      icon: DeliveriesIcon,
      accent: 'border-slate-200 hover:border-slate-400'
    },
    {
      key: 'totalWaste',
      label: 'Waste Plates',
      value: summary.totalWaste ?? 0,
      subtext: 'Damaged or scrap material',
      icon: TrashIcon,
      accent: 'border-slate-200 hover:border-slate-400'
    },
    {
      key: 'weeklyRevenue',
      label: 'Weekly Revenue',
      value: `₹${Number(summary.weeklyRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: 'Billed in past 7 days',
      icon: CurrencyRupeeIcon,
      accent: 'border-slate-200 hover:border-slate-400'
    },
    {
      key: 'pendingBills',
      label: 'Pending Bills',
      value: summary.pendingBills ?? 0,
      subtext: 'Invoices generated',
      icon: ClockIcon,
      accent: 'border-slate-200 hover:border-amber-300'
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
      {/* Top Professional Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                Metal Plate ERP
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Inventory & Operations Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Monitor real-time plate stock levels, client deliveries, revenue generation, and pending invoices.
            </p>
          </div>

          {/* Quick Action Buttons with Crisp Borders & Hover Effects */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/purchases')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 hover:shadow transition-all duration-150 active:scale-95"
            >
              <PlusIcon className="w-4 h-4 text-slate-700" />
              New Purchase
            </button>
            <button
              onClick={() => navigate('/deliveries')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 hover:border-slate-600 transition-all duration-150 active:scale-95"
            >
              <PlusIcon className="w-4 h-4 text-slate-300" />
              New Delivery
            </button>
            <button
              onClick={() => navigate('/bills')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 hover:border-slate-600 transition-all duration-150 active:scale-95"
            >
              <PlusIcon className="w-4 h-4 text-slate-300" />
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="message-box message-box-error flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Professional Metrics Grid - Refined Whites & Slates, No Rainbow Noise */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.key}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${card.accent}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                    {loading ? (
                      <span className="inline-block w-16 h-7 bg-slate-100 animate-pulse rounded"></span>
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-700 shadow-none">
                  <IconComp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{card.subtext}</span>
                {card.badge && (
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Stock Distribution Overview */}
      <div className="page-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="section-title text-base font-bold">Plate Stock Inventory Flow</h2>
            <p className="text-xs text-slate-500">Ratio of delivered plates and scrap against total purchased</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-slate-900"></span>
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

        {/* Progress bar */}
        <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200">
          <div
            style={{ width: `${deliveredPct}%` }}
            className="bg-slate-900 transition-all duration-500"
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
          <div>
            <span className="text-slate-400 block">Total Inflow</span>
            <span className="font-semibold text-slate-800 text-sm">{totalPurchased} plates</span>
          </div>
          <div>
            <span className="text-slate-400 block">Total Outflow</span>
            <span className="font-semibold text-slate-800 text-sm">{totalDelivered} plates</span>
          </div>
          <div>
            <span className="text-slate-400 block">Current In-Hand</span>
            <span className="font-semibold text-emerald-700 text-sm">{summary.availableStock ?? 0} plates</span>
          </div>
          <div>
            <span className="text-slate-400 block">Scrap / Waste</span>
            <span className="font-semibold text-rose-600 text-sm">{totalWaste} plates</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Companies & Operations Status */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Recent Companies Table */}
        <div className="page-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title text-base font-bold">Recent Registered Companies</h2>
              <p className="text-xs text-slate-500">Latest active corporate clients</p>
            </div>
            <button
              onClick={() => navigate('/companies')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-slate-600 transition-colors"
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
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-medium text-slate-900">
                      {company.company_name}
                    </td>
                    <td>{company.contact_person || 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/companies/${company.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
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
                        className="text-slate-900 font-semibold underline ml-1"
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

        {/* Operational Highlights */}
        <div className="page-card">
          <h2 className="section-title text-base font-bold mb-4">System Notifications</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Live Inventory Validation</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deliveries check available plate stock before dispatch to prevent negative stock counts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0"></span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Direct Invoicing & PDF</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Print, download PDF, or share invoices directly via WhatsApp and Email from the Billing tab.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <span className="mt-1 h-2 w-2 rounded-full bg-slate-400 shrink-0"></span>
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
