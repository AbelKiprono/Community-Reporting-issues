const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Categories with urgency base weights
  const categories = [
    { name: 'Road damage / Pothole', baseWeight: 6 },
    { name: 'Garbage collection', baseWeight: 5 },
    { name: 'Theft / Security', baseWeight: 9 },
    { name: 'Water / Drainage', baseWeight: 7 },
    { name: 'Streetlight / Electricity', baseWeight: 6 },
    { name: 'Other', baseWeight: 2 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { baseWeight: c.baseWeight },
      create: c,
    });
  }
  console.log('âœ… Categories seeded');

  // Admin user
  const adminEmail = 'admin@nyeri.go.ke';
  const adminPass = 'Admin@123';
  const passwordHash = await bcrypt.hash(adminPass, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: 'Nyeri Ward Administrator',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      ward: 'Nyeri Town',
    },
  });
  console.log(`âœ… Admin user seeded: ${adminEmail} / ${adminPass}`);

  // Sample citizen
  const citizenEmail = 'citizen@test.com';
  const citizenPass = 'Test@123';
  const citizenHash = await bcrypt.hash(citizenPass, 12);
  await prisma.user.upsert({
    where: { email: citizenEmail },
    update: {},
    create: {
      fullName: 'Test Citizen',
      email: citizenEmail,
      passwordHash: citizenHash,
      role: 'citizen',
      ward: 'Nyeri Town',
    },
  });
  console.log(`âœ… Citizen user seeded: ${citizenEmail} / ${citizenPass}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
