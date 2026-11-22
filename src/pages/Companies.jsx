import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../lib/api.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { SearchIcon, PlusIcon, CompaniesIcon } from '../components/Icons.jsx';

const initialForm = {
  name: '',
  contactPerson: '',
  phone: '',
  plateTypes: [],
  plateRates: {}
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { showPopup, showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await authFetch('/companies');
      setCompanies(data.companies || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveCompany(event) {
    event.preventDefault();
    setMessage('');
    if (form.plateTypes.length === 0) {
      setMessage('Please select at least one plate type.');
      return;
    }
    const payload = {
      company_name: form.name,
      contact_person: form.contactPerson,
      phone_number: form.phone,
      plate_type: form.plateTypes.join(','),
      plate_rates: JSON.stringify(form.plateRates)
    };

    try {
      setLoading(true);
      if (selected) {
        await authFetch(`/companies/${selected.id}`, { method: 'PUT', body: payload });
        showPopup({
          title: 'Company Updated!',
          message: `${form.name} details have been updated successfully.`,
          details: `Contact: ${form.contactPerson || 'N/A'} • Plate Types: ${form.plateTypes.join(', ')}`
        });
      } else {
        await authFetch('/companies', { method: 'POST', body: payload });
        showPopup({
          title: 'Company Successfully Added!',
          message: `${form.name} has been registered into the billing system.`,
          details: `Contact: ${form.contactPerson || 'N/A'} • Phone: ${form.phone || 'N/A'} • Plate Types: ${form.plateTypes.join(', ')}`
        });
      }
      setForm(initialForm);
      setSelected(null);
      loadCompanies();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function editCompany(company) {
    setSelected(company);
    setForm({
      name: company.company_name,
      contactPerson: company.contact_person,
      phone: company.phone_number,
      plateTypes: (company.plate_type || '').split(',').map((type) => type.trim()).filter(Boolean),
      plateRates: (() => {
        try {
          return JSON.parse(company.plate_rates || '{}');
        } catch {
          return {};
        }
      })()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteCompany(id, companyName) {
    if (!window.confirm(`Are you sure you want to delete "${companyName}"? This will remove all associated records.`)) return;
    try {
      await authFetch(`/companies/${id}`, { method: 'DELETE' });
      showToast({ title: 'Company Deleted', message: `${companyName} was removed.`, type: 'info' });
      loadCompanies();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Error', message: error.message, type: 'error' });
    }
  }

  const filtered = companies.filter((company) =>
    (company.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (company.contact_person || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Card with Clean Border and Hover */}
      <div className="page-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                Directory
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage client companies, assign plate varieties, and configure pricing rates.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search by company or contact..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="message-box message-box-error flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline font-semibold">Dismiss</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Form Card */}
        <div className="page-card">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div>
              <h2 className="section-title text-lg font-bold">
                {selected ? 'Edit Company' : 'Add New Company'}
              </h2>
              <p className="text-xs text-slate-500">
                {selected ? 'Modify existing company credentials' : 'Register a new customer profile'}
              </p>
            </div>
            {selected && (
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setForm(initialForm);
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={saveCompany} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. Apex Industrial Supplies"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Contact Person
                </label>
                <input
                  placeholder="e.g. Rajesh Kumar"
                  value={form.contactPerson}
                  onChange={(event) => setForm({ ...form, contactPerson: event.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number
              </label>
              <input
                placeholder="e.g. +91 98765 43210"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>

            {/* Plate Types Selection with Crisp Interactive Borders */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Supported Plate Types <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['A', 'B', 'C', 'D', 'E', 'F'].map((type) => {
                  const isChecked = form.plateTypes.includes(type);
                  return (
                    <label
                      key={type}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 cursor-pointer text-sm font-semibold transition-all duration-150 ${
                        isChecked
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={(event) => setForm({
                          ...form,
                          plateTypes: event.target.checked
                            ? [...form.plateTypes, type]
                            : form.plateTypes.filter((selectedType) => selectedType !== type),
                          plateRates: event.target.checked
                            ? { ...form.plateRates, [type]: form.plateRates[type] ?? '' }
                            : Object.fromEntries(Object.entries(form.plateRates).filter(([plateType]) => plateType !== type))
                        })}
                      />
                      <span>Type {type}</span>
                    </label>
                  );
                })}
              </div>

              {/* Price rate per selected type */}
              {form.plateTypes.length > 0 && (
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Set Price per Plate (₹)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {form.plateTypes.map((type) => (
                      <div key={type}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Type {type} Rate (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          placeholder="e.g. 120.00"
                          value={form.plateRates[type] ?? ''}
                          onChange={(event) => setForm({
                            ...form,
                            plateRates: { ...form.plateRates, [type]: event.target.value }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Saving...' : selected ? 'Update Company Details' : '+ Register Company'}
              </button>
            </div>
          </form>
        </div>

        {/* Company List Table Card with Row Hover Effects & Borders */}
        <div className="page-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="section-title text-lg font-bold">Company Directory</h2>
              <p className="text-xs text-slate-500">{filtered.length} companies registered</p>
            </div>
          </div>

          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Plate Rates</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => {
                  let ratesText = 'Not set';
                  try {
                    const parsed = JSON.parse(company.plate_rates || '{}');
                    const entries = Object.entries(parsed);
                    if (entries.length > 0) {
                      ratesText = entries.map(([t, r]) => `${t}: ₹${Number(r).toFixed(0)}`).join(', ');
                    }
                  } catch {
                    ratesText = 'Not set';
                  }

                  return (
                    <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                      <td>
                        <button
                          onClick={() => navigate(`/companies/${company.id}`)}
                          className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-left"
                        >
                          {company.company_name}
                        </button>
                        {company.phone_number && (
                          <span className="block text-xs text-slate-400 mt-0.5">{company.phone_number}</span>
                        )}
                      </td>
                      <td>{company.contact_person || 'N/A'}</td>
                      <td>
                        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {ratesText}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => editCompany(company)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCompany(company.id, company.company_name)}
                            className="btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">
                      No companies match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
