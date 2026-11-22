import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  DashboardIcon,
  CompaniesIcon,
  PurchasesIcon,
  DeliveriesIcon,
  BillsIcon,
  ReportsIcon,
  SettingsIcon,
  LayersIcon
} from './Icons.jsx';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/companies', label: 'Companies', icon: CompaniesIcon },
    { to: '/purchases', label: 'Purchases', icon: PurchasesIcon },
    { to: '/deliveries', label: 'Deliveries', icon: DeliveriesIcon },
    { to: '/bills', label: 'Billing', icon: BillsIcon },
    { to: '/reports', label: 'Reports', icon: ReportsIcon },
    { to: '/settings', label: 'Office Settings', icon: SettingsIcon }
  ];

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-800/80 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-white shadow-sm">
            <LayersIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Metal Plate System</h1>
            <p className="text-[11px] font-medium text-slate-400">Inventory & Invoicing</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          Main Menu
        </div>
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 border ${
                    isActive
                      ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                      : 'text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-800'
                  }`
                }
              >
                <IconComponent className="w-5 h-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300">System Ready</span>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">Backend Connected (Render)</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile / Tablet Header Bar */}
      <div className="xl:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <LayersIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Metal Plate System</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-slate-900 text-slate-100 p-5 shadow-2xl flex flex-col z-50">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden xl:flex xl:w-64 xl:flex-col shrink-0 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-sm min-h-[calc(100vh-3rem)]">
        {navContent}
      </aside>
    </>
  );
}
