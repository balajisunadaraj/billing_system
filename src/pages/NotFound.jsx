import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto mt-16 max-w-md px-4">
      <div className="page-card text-center py-10">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
          Error 404
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The requested page could not be located. Please return to the dashboard.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
