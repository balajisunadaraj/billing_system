import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

const cards = [
  { key: 'totalCompanies', label: 'Total Companies', color: 'from-cyan-500 to-blue-600' },
  { key: 'totalPurchased', label: 'Plates Purchased', color: 'from-violet-500 to-indigo-600' },
  { key: 'totalDelivered', label: 'Plates Delivered', color: 'from-emerald-500 to-teal-600' },
  { key: 'availableStock', label: 'Available Stock', color: 'from-slate-500 to-slate-700' },
  { key: 'totalWaste', label: 'Waste Plates', color: 'from-amber-500 to-orange-600' },
  { key: 'weeklyRevenue', label: 'Weekly Revenue', color: 'from-fuchsia-500 to-pink-600' },
  { key: 'pendingBills', label: 'Pending Bills', color: 'from-rose-500 to-red-600' }
];

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    try {
      const data = await authFetch('/dashboard');
      setSummary(data);
      setCompanies(data.recentCompanies || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="hero-card">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard summary</p>
          <h2 className="mt-4 text-4xl font-semibold">Metal Plate Inventory & Billing</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Manage companies, purchases, deliveries, invoices and reports from a single modern dashboard.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button className="rounded-3xl bg-white px-5 py-4 text-left text-slate-900 shadow-soft transition hover:-translate-y-0.5">
            New Purchase
          </button>
          <button className="rounded-3xl bg-white px-5 py-4 text-left text-slate-900 shadow-soft transition hover:-translate-y-0.5">
            New Delivery
          </button>
          <button className="rounded-3xl bg-white px-5 py-4 text-left text-slate-900 shadow-soft transition hover:-translate-y-0.5">
            Generate Invoice
          </button>
        </div>
      </div>

      {message && <div className="message-box">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.key} className="rounded-[28px] bg-gradient-to-br p-6 text-white shadow-soft">
            <p className="text-sm font-medium text-slate-200">{card.label}</p>
            <p className="mt-6 text-4xl font-semibold">{summary[card.key] ?? '0'}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="page-card">
          <h3 className="section-title">Recent Companies</h3>
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-slate-200 last:border-none">
                    <td>{company.name}</td>
                    <td>{company.contact_person}</td>
                    <td>{company.remaining_stock}</td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-slate-500">
                      No companies yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-card">
          <h3 className="section-title">Notifications</h3>
          <div className="space-y-4">
            <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 text-rose-700">
              Low stock alerts will appear here once your delivery and purchase records update.
            </div>
            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-amber-700">
              Pending invoices are tracked automatically after billing entries.
            </div>
            <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5 text-cyan-700">
              Today’s purchases and deliveries are shown in the purchase and delivery pages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
