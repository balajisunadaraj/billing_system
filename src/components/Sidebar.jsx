import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/companies', label: 'Companies' },
    { to: '/purchases', label: 'Purchases' },
    { to: '/deliveries', label: 'Deliveries' },
    { to: '/bills', label: 'Billing' },
    { to: '/reports', label: 'Reports' },
    { to: '/settings', label: 'Office Settings' }
  ];

  return (
    <aside className="hidden xl:block xl:w-72 bg-slate-950 text-slate-100 p-6 rounded-3xl shadow-soft">
      <div className="mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Metal Plate System
        </div>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">Admin dashboard for inventory, purchases, deliveries, and billing.</p>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
