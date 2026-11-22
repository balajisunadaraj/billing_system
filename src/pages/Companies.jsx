import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

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
      setMessage('Select at least one plate type.');
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
      if (selected) {
        await authFetch(`/companies/${selected.id}`, { method: 'PUT', body: payload });
        setMessage('Company updated successfully.');
      } else {
        await authFetch('/companies', { method: 'POST', body: payload });
        setMessage('Company added successfully.');
      }
      setForm(initialForm);
      setSelected(null);
      loadCompanies();
    } catch (error) {
      setMessage(error.message);
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
  }

  async function deleteCompany(id) {
    if (!window.confirm('Delete this company?')) return;
    try {
      await authFetch(`/companies/${id}`, { method: 'DELETE' });
      setMessage('Company removed.');
      loadCompanies();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filtered = companies.filter((company) =>
    company.company_name.toLowerCase().includes(search.toLowerCase()) ||
    company.contact_person.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="page-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Company Management</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Companies</h1>
          </div>
          <input
            placeholder="Search companies..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>
      </div>

      {message && (
        <div className={message.includes('deleted') || message.includes('removed') ? 'message-box message-box-success' : message.includes('updated') || message.includes('added') ? 'message-box message-box-success' : 'message-box message-box-error'}>
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="page-card">
          <h2 className="section-title">Add / Edit Company</h2>
          <form onSubmit={saveCompany} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Company Name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Contact Person
                <input
                  value={form.contactPerson}
                  onChange={(event) => setForm({ ...form, contactPerson: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Phone Number
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <fieldset className="block text-sm font-medium text-slate-700">
              <legend>Plate Types</legend>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {['A', 'B', 'C', 'D', 'E', 'F'].map((type) => (
                  <label key={type} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={form.plateTypes.includes(type)}
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
                    {type}
                  </label>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {form.plateTypes.map((type) => (
                  <label key={type} className="block">
                    Price per {type} plate (₹)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.plateRates[type] ?? ''}
                      onChange={(event) => setForm({
                        ...form,
                        plateRates: { ...form.plateRates, [type]: event.target.value }
                      })}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="w-full rounded-3xl bg-slate-950 px-6 py-3 text-white font-medium transition-all hover:bg-slate-800 active:scale-95 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2" type="submit">
              {selected ? 'Update Company' : 'Add Company'}
            </button>
          </form>
        </div>

        <div className="page-card">
          <h2 className="section-title">Company List</h2>
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Plate Type</th>
                  <th>Plate Prices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => (
                  <tr key={company.id} className="border-b border-slate-200 last:border-none">
                    <td>{company.company_name}</td>
                    <td>{company.contact_person}</td>
                    <td>{company.plate_type || 'Not set'}</td>
                    <td>
                      {(() => {
                        try {
                          const rates = JSON.parse(company.plate_rates || '{}');
                          return Object.entries(rates).map(([type, rate]) => `${type}: ₹${Number(rate).toFixed(2)}`).join(', ') || 'Not set';
                        } catch {
                          return 'Not set';
                        }
                      })()}
                    </td>
                    <td className="space-x-2 py-4">
                      <button
                        type="button"
                        onClick={() => editCompany(company)}
                        className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCompany(company.id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-500">
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
