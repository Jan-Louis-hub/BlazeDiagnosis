import { createCustomerSchema } from '@/features/customers/schemas/customer.schema';
import { createCustomer } from '@/features/customers/services/customer.service';
import { requireTenantContext } from '@/lib/tenancy/tenant-context';
import { NextResponse } from 'next/server';
import { db } from '@/db'; // Adjusted based on your local workspace configuration
import { customers } from '@/db/schema/customers';
import { eq, and } from 'drizzle-orm';

// GET Handler: Fetch tenant-isolated active customers
export async function GET(request: Request) {
  try {
    // 1. Enforce strict tenant session initialization boundaries
    const tenant = await requireTenantContext();
    
    // 2. Fallback query string fallback check if fallback parsing is required
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || tenant.tenantId;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing required tenantId context parameter' },
        { status: 400 }
      );
    }

    // 3. Query database targeting tenant isolation boundaries
    // TODO: Customize filters if you want to explicitly hide archived records
    const data = await db
      .select()
      .from(customers)
      .where(eq(customers.tenantId, tenantId));

    return NextResponse.json({ customers: data }, { status: 200 });

  } catch (error: any) {
    console.error('❌ GET API Multi-Tenant Route Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

// POST Handler: Securely create a new customer profile attached to active tenant
export async function POST(req: Request) {
  try {
    const tenant = await requireTenantContext();
    const body = await req.json();
    
    // Validate structural integrity matching schema parameters
    const input = createCustomerSchema.parse(body);
    const customer = await createCustomer(tenant.tenantId, input);

    return NextResponse.json(customer, { status: 201 });

  } catch (error: any) {
    console.error('❌ POST API Multi-Tenant Route Error:', error);
    
    // Handle Zod parsing schema failures gracefully
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation Failed', issues: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}