import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@sipahadig.bengkulu.go.id" },
    update: {},
    create: {
      email: "admin@sipahadig.bengkulu.go.id",
      // IMPORTANT: In a real application, you should hash the password.
      // For simplicity, we are using a plain text password here.
      // Please change this password in a production environment.
      password: "password123",
    },
  });

  console.log({ admin });

  const kategoriDokumen = [
    { nama: 'SK TIM Pemeriksa', slug: 'sk-tim-pemeriksa' },
    { nama: 'Surat Panggilan', slug: 'surat-panggilan' },
    { nama: 'Berkas BAP', slug: 'berkas-bap' },
    { nama: 'Resume BAP', slug: 'resume-bap' },
    { nama: 'Telaahan', slug: 'telaahan' },
  ];

  for (const kategori of kategoriDokumen) {
    await prisma.kategoriDokumen.upsert({
      where: { slug: kategori.slug },
      update: {},
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
