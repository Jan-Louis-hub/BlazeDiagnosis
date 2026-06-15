import { createCustomerSchema } from '@/features/customers/schemas/customer.schema';
import { createCustomer } from '@/features/customers/services/customer.service';
import { requireTenantContext } from '@/lib/tenancy/tenant-context';
import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { customers } from '@/db/schema/customers';
import { and, eq } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        // Get the tenantId from the URL query string
        const {searchParams} = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        // Validate that the tenantId is provided
        if (!tenantId) {
            return NextResponse.json(
                {error: 'Missing required tenantId parameter'},
                {status: 400}
            );
        }
          const activeCustomers = await db
      .select()
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.isArchived, false)
        )
      );

    // Return the clean data list payload
    return NextResponse.json(activeCustomers);

// Implemented the catch sequence for the error handling.
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
// TODO: Add the POST method to create a new customer and return the created customer in the response

export async function POST(req: Request) {
  try {
    const tenant = await requireTenantContext();
    const body = await req.json();
    const input = createCustomerSchema.parse(body);
    const customer = await createCustomer(tenant.tenantId, input);

    return NextResponse.json(customer, { status: 201 });
  }
};

//TODO: Add the catch statement to the try operator dont forget to return JSON