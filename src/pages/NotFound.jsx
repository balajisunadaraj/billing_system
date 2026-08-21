import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto mt-20 max-w-xl px-4">
      <div className="page-card text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Page not found</p>
        <h1 className="mt-6 text-5xl font-semibold text-slate-900">404</h1>
        <p className="mt-4 text-slate-600">The page you are looking for does not exist. Please return to the dashboard.</p>
        <Link to="/dashboard" className="mt-8 inline-flex rounded-3xl bg-slate-950 px-6 py-3 text-white transition hover:bg-slate-800">
          Go back
        </Link>
      </div>
    </div>
  );
}
