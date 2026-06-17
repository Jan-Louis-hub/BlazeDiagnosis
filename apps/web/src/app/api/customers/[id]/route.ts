import { getCustomerById } from '@/features/customers/services/customer.service';
import { NextRequest, NextResponse } from 'next/server';
import { deleteCustomer } from '@/features/customers/services/customer.service';
import { requireTenantContext } from '@/lib/tenancy/tenant-context';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Get the tenantId from the URL query string
  const { id } = await params;
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  // Validate that the tenantId is provided
  if (!tenantId) 
  {
    return NextResponse.json(
      { error: 'Missing required tenantId parameter' },
      { status: 400 },
    );
  }

  try {
      const DB= await getCustomerById(tenantId, id)
      return NextResponse.json(DB)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch Customer details' },
        { status: 500 },
      );
    }
}

// DELETE function
export async function DELETE(
  request: NextRequest,
  // params comes from the UR
  { params }: { params: { id: string } },
) {
  try {
    // Step 1: Identify which tenant is making the request
    const tenant = await requireTenantContext();
     // Step 2: Extract customer ID from URL params
    const { id } = params;
    // Step 3: Call service layer to delete customer from database
    // We pass tenantId to ensure the customer belongs to the correct tenant
    await deleteCustomer(tenant.tenantId, id);
    // Step 4: Return success response to frontend
    return NextResponse.json(
      { message: 'Customer deleted successfully' },
      { status: 200 }, // 200 = OK (request successful)
    );
  } catch (error) {
    // Step 5: If anything goes wrong (DB error, missing record, etc.)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }, // 500 = Server error (something broke on backend)
    );
  }
}
