import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seeds the same demo users and partners as the in-memory repositories
 * (see src/repositories/InMemoryUserRepository.ts and
 * InMemoryPartnerRepository.ts), so switching DATABASE_URL on does not
 * change the data available for local testing.
 *
 * Run with: npm run db:seed
 */
async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@brace-initiative.org' },
    update: {},
    create: {
      email: 'admin@brace-initiative.org',
      passwordHash,
      fullName: 'AGENDA Tanzania Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'reviewer@oeko-institut.de' },
    update: {},
    create: {
      email: 'reviewer@oeko-institut.de',
      passwordHash,
      fullName: 'Oeko-Institut Technical Reviewer',
      role: 'TECHNICAL_REVIEWER',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'coordinator.gh@brace-initiative.org' },
    update: {},
    create: {
      email: 'coordinator.gh@brace-initiative.org',
      passwordHash,
      fullName: 'Ghana Country Coordinator',
      role: 'COUNTRY_COORDINATOR',
      countryAffiliation: 'Ghana',
      isActive: true,
    },
  });

  const partners: Array<{
    id: string;
    name: string;
    country: string;
    role: string;
    isTechnicalLead: boolean;
  }> = [
    {
      id: 'agenda-tanzania',
      name: 'AGENDA Tanzania',
      country: 'Tanzania',
      role: 'Consortium lead and funding recipient; overall content responsibility',
      isTechnicalLead: false,
    },
    {
      id: 'oeko-institut',
      name: 'Oeko-Institut e.V.',
      country: 'Germany',
      role: 'Technical and scientific leadership; quality control',
      isTechnicalLead: true,
    },
    {
      id: 'pan-ethiopia',
      name: 'PAN Ethiopia',
      country: 'Ethiopia',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
    {
      id: 'sradev-nigeria',
      name: 'SRADev Nigeria',
      country: 'Nigeria',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
    {
      id: 'mri-ghana',
      name: 'MRI Ghana',
      country: 'Ghana',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
    {
      id: 'crepd-cameroon',
      name: 'CREPD Cameroon',
      country: 'Cameroon',
      role: 'Country partner; French-language editorial advisor',
      isTechnicalLead: false,
    },
    {
      id: 'areco-rwanda',
      name: 'ARECO Rwanda',
      country: 'Rwanda',
      role: 'Country partner; French-language editorial advisor',
      isTechnicalLead: false,
    },
    {
      id: 'cure-malawi',
      name: 'CURE Malawi',
      country: 'Malawi',
      role: 'Country partner - country support and reporting',
      isTechnicalLead: false,
    },
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { id: partner.id },
      update: {},
      create: partner,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete: 3 users, 8 partners.');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
