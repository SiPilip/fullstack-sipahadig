import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sipahadig.bengkulu.go.id' },
    update: {},
    create: {
      email: 'admin@sipahadig.bengkulu.go.id',
      password: 'admin',
    },
  });
  console.log({ admin });

  // Seed Document Categories
  const kategoriDokumen = [
    // Existing categories
    { nama: 'SK TIM Pemeriksa', slug: 'sk-tim-pemeriksa' },
    { nama: 'Surat Panggilan', slug: 'surat-panggilan' },
    { nama: 'Berkas BAP', slug: 'berkas-bap' },
    { nama: 'Resume BAP', slug: 'resume-bap' },
    { nama: 'Telaahan', slug: 'telaahan' },
    // New categories for Hukuman Disiplin SKs
    { nama: 'SK Hukuman Ringan', slug: 'sk-hukuman-ringan' },
    { nama: 'SK Hukuman Sedang', slug: 'sk-hukuman-sedang' },
    { nama: 'SK Hukuman Berat', slug: 'sk-hukuman-berat' },
  ];

  for (const kategori of kategoriDokumen) {
    await prisma.kategoriDokumen.upsert({
      where: { slug: kategori.slug },
      update: { nama: kategori.nama }, // Ensure name is updated if it changes
      create: {
        ...kategori,
        folderId: 'ganti-dengan-id-folder-asli',
      },
    });
  }

  console.log('Seeded Kategori Dokumen');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });