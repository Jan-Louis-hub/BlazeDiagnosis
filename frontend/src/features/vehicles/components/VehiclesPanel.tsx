'use client';

import { useEffect, useState } from 'react';
import { customersApi } from '../../customers/api/customers.api';
import type { CustomerRecord } from '../../customers/types/customers.types';
import { vehiclesApi } from '../api/vehicles.api';
import type { VehicleCreatePayload, VehicleRecord } from '../types/vehicles.types';

const DEFAULT_TENANT_ID = 'tenant_demo';

const initialForm: VehicleCreatePayload = {
  tenantId: DEFAULT_TENANT_ID,
  customerId: 'cust_demo_1',
  registrationNumber: '',
  vin: '',
  make: '',
  model: '',
  variant: '',
  year: undefined,
  engineType: '',
  fuelType: '',
  transmission: '',
  odometer: undefined,
  color: '',
};

export function VehiclesPanel() {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleCreatePayload>(initialForm);

  async function loadVehicles(query?: string) {
    setLoading(true);
    setError(undefined);
    try {
      const [vehicleResults, customerResults] = await Promise.all([
        vehiclesApi.list(DEFAULT_TENANT_ID, query),
        customersApi.list(DEFAULT_TENANT_ID),
      ]);
      setVehicles(vehicleResults);
      setCustomers(customerResults);
      if (!editingId && customerResults[0] && !form.customerId) {
        setForm((current) => ({ ...current, customerId: customerResults[0].id }));
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load vehicles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm((current) => ({ ...initialForm, customerId: customers[0]?.id || current.customerId || 'cust_demo_1' }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        odometer: form.odometer ? Number(form.odometer) : undefined,
      };

      if (editingId) {
        await vehiclesApi.update(editingId, payload);
      } else {
        await vehiclesApi.create(payload);
      }
      resetForm();
      await loadVehicles(search || undefined);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save vehicle.');
    }
  }

  async function handleArchive(id: string) {
    try {
      await vehiclesApi.archive(id);
      if (editingId === id) resetForm();
      await loadVehicles(search || undefined);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to archive vehicle.');
    }
  }

  function startEdit(vehicle: VehicleRecord) {
    setEditingId(vehicle.id);
    setForm({
      tenantId: vehicle.tenantId,
      customerId: vehicle.customerId,
      registrationNumber: vehicle.registrationNumber,
      vin: vehicle.vin || '',
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant || '',
      year: vehicle.year,
      engineType: vehicle.engineType || '',
      fuelType: vehicle.fuelType || '',
      transmission: vehicle.transmission || '',
      odometer: vehicle.odometer,
      color: vehicle.color || '',
    });
  }

  function customerNameFor(vehicle: VehicleRecord) {
    return customers.find((customer) => customer.id === vehicle.customerId)?.fullName || vehicle.customerId;
  }

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2>Vehicles</h2>
          <p>Create, edit, archive, and search vehicle records.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reg, VIN, make, model" />
          <button type="button" onClick={() => void loadVehicles(search || undefined)} disabled={loading}>Search</button>
          <button type="button" onClick={() => { setSearch(''); void loadVehicles(); }} disabled={loading}>Clear</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 16 }}>
        <form onSubmit={(event) => void handleSubmit(event)} style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'grid', gap: 10 }}>
          <strong>{editingId ? 'Edit vehicle' : 'Add vehicle'}</strong>
          <select value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))} required>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName}</option>)}
          </select>
          <input value={form.registrationNumber} onChange={(event) => setForm((current) => ({ ...current, registrationNumber: event.target.value.toUpperCase() }))} placeholder="Registration number" required />
          <input value={form.vin || ''} onChange={(event) => setForm((current) => ({ ...current, vin: event.target.value.toUpperCase() }))} placeholder="VIN" />
          <input value={form.make} onChange={(event) => setForm((current) => ({ ...current, make: event.target.value }))} placeholder="Make" required />
          <input value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} placeholder="Model" required />
          <input value={form.variant || ''} onChange={(event) => setForm((current) => ({ ...current, variant: event.target.value }))} placeholder="Variant" />
          <input value={form.year || ''} onChange={(event) => setForm((current) => ({ ...current, year: event.target.value ? Number(event.target.value) : undefined }))} placeholder="Year" />
          <input value={form.engineType || ''} onChange={(event) => setForm((current) => ({ ...current, engineType: event.target.value }))} placeholder="Engine type" />
          <input value={form.fuelType || ''} onChange={(event) => setForm((current) => ({ ...current, fuelType: event.target.value }))} placeholder="Fuel type" />
          <input value={form.transmission || ''} onChange={(event) => setForm((current) => ({ ...current, transmission: event.target.value }))} placeholder="Transmission" />
          <input value={form.odometer || ''} onChange={(event) => setForm((current) => ({ ...current, odometer: event.target.value ? Number(event.target.value) : undefined }))} placeholder="Odometer" />
          <input value={form.color || ''} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} placeholder="Color" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">{editingId ? 'Save changes' : 'Create vehicle'}</button>
            {editingId ? <button type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <div style={{ display: 'grid', gap: 12 }}>
          {loading ? <div style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>Loading vehicles…</div> : null}
          {!loading && vehicles.length === 0 ? <div style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>No vehicles found.</div> : null}
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 12, display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <strong>{vehicle.registrationNumber}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => startEdit(vehicle)}>Edit</button>
                  <button type="button" onClick={() => void handleArchive(vehicle.id)}>Archive</button>
                </div>
              </div>
              <div>{vehicle.make} {vehicle.model}{vehicle.variant ? ` ${vehicle.variant}` : ''}</div>
              <div>Owner: {customerNameFor(vehicle)}</div>
              <div>{vehicle.year || 'Year n/a'} · {vehicle.odometer || 0} km</div>
              <div>{vehicle.vin || 'No VIN'} · {vehicle.fuelType || 'Fuel n/a'} · {vehicle.transmission || 'Transmission n/a'}</div>
            </div>
          ))}
        </div>
      </div>

      {error ? <div style={{ padding: 12, background: '#fef2f2', borderRadius: 8 }}>{error}</div> : null}
    </section>
  );
}
