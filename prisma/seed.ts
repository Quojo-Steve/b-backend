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
    about: string;
    description: string;
  }> = [
    {
      id: 'agenda-tanzania',
      name: 'AGENDA Tanzania',
      country: 'Tanzania',
      about: 'Consortium lead',
      description: 'Consortium lead and funding recipient; overall content responsibility',
    },
    {
      id: 'oeko-institut',
      name: 'Oeko-Institut e.V.',
      country: 'Germany',
      about: 'Technical and scientific leadership',
      description: 'Technical and scientific leadership; quality control',
    },
    {
      id: 'pan-ethiopia',
      name: 'PAN Ethiopia',
      country: 'Ethiopia',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
    },
    {
      id: 'sradev-nigeria',
      name: 'SRADev Nigeria',
      country: 'Nigeria',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
    },
    {
      id: 'mri-ghana',
      name: 'MRI Ghana',
      country: 'Ghana',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
    },
    {
      id: 'crepd-cameroon',
      name: 'CREPD Cameroon',
      country: 'Cameroon',
      about: 'Country partner',
      description: 'Country partner; French-language editorial advisor',
    },
    {
      id: 'areco-rwanda',
      name: 'ARECO Rwanda',
      country: 'Rwanda',
      about: 'Country partner',
      description: 'Country partner; French-language editorial advisor',
    },
    {
      id: 'cure-malawi',
      name: 'CURE Malawi',
      country: 'Malawi',
      about: 'Country partner',
      description: 'Country partner - country support and reporting',
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
