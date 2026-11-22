import { Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext.jsx';
import NotificationModal from './components/NotificationModal.jsx';
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
    <NotificationProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
        <NotificationModal />
        <div className="flex-1 xl:flex xl:gap-6 xl:p-6 max-w-[1720px] w-full mx-auto">
          <Sidebar />
          <main className="flex-1 min-w-0 p-4 sm:p-6 xl:p-0">
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
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
