'use client';

import { useEffect, useMemo, useState } from 'react';
import { customersApi } from '../api/customers.api';
import type { CustomerCreatePayload, CustomerRecord } from '../types/customers.types';

const DEFAULT_TENANT_ID = 'tenant_demo';

const initialForm: CustomerCreatePayload = {
  tenantId: DEFAULT_TENANT_ID,
  fullName: '',
  mobileNumber: '',
  alternateNumber: '',
  email: '',
  address: '',
  companyName: '',
  taxNumber: '',
  preferredCommunicationChannel: 'EMAIL',
  marketingConsent: false,
};

export function CustomersPanel() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerCreatePayload>(initialForm);

  async function loadCustomers(query?: string) {
    setLoading(true);
    setError(undefined);
    try {
      const response = await customersApi.list(DEFAULT_TENANT_ID, query);
      setCustomers(response);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load customers.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  const heading = useMemo(() => editingId ? 'Edit customer' : 'Add customer', [editingId]);

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    try {
      if (editingId) {
        await customersApi.update(editingId, form);
      } else {
        await customersApi.create(form);
      }
      resetForm();
      await loadCustomers(search || undefined);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save customer.');
    }
  }

  async function handleArchive(id: string) {
    try {
      await customersApi.archive(id);
      if (editingId === id) resetForm();
      await loadCustomers(search || undefined);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to archive customer.');
    }
  }

  function startEdit(customer: CustomerRecord) {
    setEditingId(customer.id);
    setForm({
      tenantId: customer.tenantId,
      fullName: customer.fullName,
      mobileNumber: customer.mobileNumber,
      alternateNumber: customer.alternateNumber || '',
      email: customer.email || '',
      address: customer.address || '',
      companyName: customer.companyName || '',
      taxNumber: customer.taxNumber || '',
      preferredCommunicationChannel: customer.preferredCommunicationChannel || 'EMAIL',
      marketingConsent: customer.marketingConsent,
    });
  }

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2>Customers</h2>
          <p>Create, edit, archive, and search customer records.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, email, company"
          />
          <button type="button" onClick={() => void loadCustomers(search || undefined)} disabled={loading}>Search</button>
          <button type="button" onClick={() => { setSearch(''); void loadCustomers(); }} disabled={loading}>Clear</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 16 }}>
        <form onSubmit={(event) => void handleSubmit(event)} style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'grid', gap: 10 }}>
          <strong>{heading}</strong>
          <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" required />
          <input value={form.mobileNumber} onChange={(event) => setForm((current) => ({ ...current, mobileNumber: event.target.value }))} placeholder="Mobile number" required />
          <input value={form.alternateNumber || ''} onChange={(event) => setForm((current) => ({ ...current, alternateNumber: event.target.value }))} placeholder="Alternate number" />
          <input value={form.email || ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
          <input value={form.companyName || ''} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} placeholder="Company name" />
          <input value={form.address || ''} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" />
          <select value={form.preferredCommunicationChannel || 'EMAIL'} onChange={(event) => setForm((current) => ({ ...current, preferredCommunicationChannel: event.target.value as CustomerCreatePayload['preferredCommunicationChannel'] }))}>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={form.marketingConsent} onChange={(event) => setForm((current) => ({ ...current, marketingConsent: event.target.checked }))} />
            Marketing consent
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">{editingId ? 'Save changes' : 'Create customer'}</button>
            {editingId ? <button type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <div style={{ display: 'grid', gap: 12 }}>
          {loading ? <div style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>Loading customers…</div> : null}
          {!loading && customers.length === 0 ? <div style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>No customers found.</div> : null}
          {customers.map((customer) => (
            <div key={customer.id} style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <strong>{customer.fullName}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => startEdit(customer)}>Edit</button>
                  <button type="button" onClick={() => void handleArchive(customer.id)}>Archive</button>
                </div>
              </div>
              <div>{customer.mobileNumber}</div>
              <div>{customer.email || 'No email'}</div>
              <div>{customer.companyName || 'Private client'}</div>
              <div>Preferred channel: {customer.preferredCommunicationChannel || 'EMAIL'}</div>
            </div>
          ))}
        </div>
      </div>

      {error ? <div style={{ padding: 12, background: '#fef2f2', borderRadius: 8 }}>{error}</div> : null}
    </section>
  );
}
