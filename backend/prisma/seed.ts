import { PrismaClient, TenantType, UserRole, UserStatus, JobStatus, QuoteStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-workshop' },
    update: {},
    create: {
      name: 'Demo Workshop',
      slug: 'demo-workshop',
      type: TenantType.SERVICE_STATION,
      contactEmail: 'owner@demoworkshop.test',
      contactPhone: '+27000000000'
    }
  });

  const branch = await prisma.branch.upsert({
    where: { id: tenant.defaultBranchId ?? 'seed-main-branch' },
    update: {
      tenantId: tenant.id,
      name: 'Main Branch'
    },
    create: {
      id: 'seed-main-branch',
      tenantId: tenant.id,
      name: 'Main Branch',
      city: 'Johannesburg'
    }
  });

  if (!tenant.defaultBranchId) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { defaultBranchId: branch.id }
    });
  }

  const user = await prisma.user.upsert({
    where: { email: 'admin@demoworkshop.test' },
    update: {},
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      fullName: 'Demo Admin',
      firstName: 'Demo',
      lastName: 'Admin',
      email: 'admin@demoworkshop.test',
      passwordHash: '$2b$10$placeholderhashreplacebeforeproduction',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true
    }
  });

  const customer = await prisma.customer.upsert({
    where: { id: 'seed-customer-1' },
    update: {},
    create: {
      id: 'seed-customer-1',
      tenantId: tenant.id,
      fullName: 'Ben Customer',
      mobileNumber: '+27000000001',
      email: 'customer@example.com'
    }
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { id: 'seed-vehicle-1' },
    update: {},
    create: {
      id: 'seed-vehicle-1',
      tenantId: tenant.id,
      customerId: customer.id,
      registrationNumber: 'AB12CDGP',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020
    }
  });

  const job = await prisma.job.upsert({
    where: { referenceNumber: 'JOB-0001' },
    update: {},
    create: {
      tenantId: tenant.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      referenceNumber: 'JOB-0001',
      status: JobStatus.AWAITING_CUSTOMER_APPROVAL,
      customerComplaint: 'Vehicle making a grinding noise from front left wheel.'
    }
  });

  await prisma.quote.upsert({
    where: { publicToken: 'seed-quote-token-1' },
    update: {},
    create: {
      tenantId: tenant.id,
      jobId: job.id,
      version: 1,
      status: QuoteStatus.SENT,
      subtotal: 1500,
      taxAmount: 225,
      discountAmount: 0,
      total: 1725,
      publicToken: 'seed-quote-token-1'
    }
  });

  console.log('Seed complete', { tenantId: tenant.id, branchId: branch.id, userId: user.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
