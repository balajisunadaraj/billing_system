import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api.js';

const initialForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  plateRate: '',
  gstApplicable: false
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
    const payload = {
      company_name: form.name,
      contact_person: form.contactPerson,
      phone_number: form.phone,
      email: form.email,
      address: form.address,
      gst_number: form.gstNumber,
      plate_rate: parseFloat(form.plateRate) || 0,
      gst_applicable: form.gstApplicable
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
      email: company.email,
      address: company.address,
      gstNumber: company.gst_number,
      plateRate: String(company.plate_rate ?? ''),
      gstApplicable: company.gst_applicable
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

      {message && <div className="message-box">{message}</div>}

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
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Phone Number
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Address
              <textarea
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                rows={3}
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                GST Number
                <input
                  value={form.gstNumber}
                  onChange={(event) => setForm({ ...form, gstNumber: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Plate Rate
                <input
                  type="number"
                  step="0.01"
                  value={form.plateRate}
                  onChange={(event) => setForm({ ...form, plateRate: event.target.value })}
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
            </div>
            <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.gstApplicable}
                onChange={(event) => setForm({ ...form, gstApplicable: event.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-slate-950 focus:ring-slate-500"
              />
              GST Applicable
            </label>
            <button className="w-full rounded-3xl bg-slate-950 px-6 py-3 text-white transition hover:bg-slate-800" type="submit">
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
                  <th>GST</th>
                  <th>Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => (
                  <tr key={company.id} className="border-b border-slate-200 last:border-none">
                    <td>{company.company_name}</td>
                    <td>{company.contact_person}</td>
                    <td>{company.gst_applicable ? 'Yes' : 'No'}</td>
                    <td>₹{(Number(company.plate_rate) || 0).toFixed(2)}</td>
                    <td className="space-x-2 py-4">
                      <button
                        type="button"
                        onClick={() => editCompany(company)}
                        className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCompany(company.id)}
                        className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
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
