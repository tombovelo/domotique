import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = '1234';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { codeAcces: '1234' },
    update: {},
    create: {
      nom: 'Admin',
      codeAcces: '1234',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Admin créé : codeAcces=1234 password=1234 (id=${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
