import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Companies from './pages/Companies.jsx';
import CompanyDetails from './pages/CompanyDetails.jsx';
import Purchases from './pages/Purchases.jsx';
import Deliveries from './pages/Deliveries.jsx';
import Bills from './pages/Bills.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="xl:flex xl:min-h-screen xl:items-stretch xl:gap-6 xl:px-6 xl:py-6">
        <Sidebar />
        <div className="flex-1 xl:rounded-[32px] xl:border xl:border-slate-200 xl:bg-white xl:shadow-soft xl:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:companyId" element={<CompanyDetails />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
