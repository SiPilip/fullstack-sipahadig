import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { arsipHukdisSchema } from '@/lib/schemas';

export async function GET(request: Request) {
  console.log("\n--- GET /api/arsip CALLED ---");
  try {
    const { searchParams } = new URL(request.url);
    const keterangan = searchParams.get('keterangan');
    const status = searchParams.get('status');
    console.log(`Params received: status=${status}, keterangan=${keterangan}`);

    let where: any = {};

    if (keterangan) {
      where.keteranganHukdis = keterangan;
    }

    if (status === 'aktif') {
      where.tanggalAkhirHukuman = { gte: new Date() };
    } else if (status === 'selesai') {
      where.tanggalAkhirHukuman = { lt: new Date() };
    }
    console.log("Prisma query `where` clause:", where);

    const arsip = await prisma.arsipHukdis.findMany({ where });
    console.log("Data fetched successfully:", arsip.length, "records");

    return NextResponse.json(arsip);
  } catch (error: any) {
    console.error("!!! ERROR fetching arsip:", error);
    return NextResponse.json({ error: `Failed to fetch arsip data: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("\n--- POST /api/arsip CALLED ---");
  try {
    const body = await request.json();
    console.log("Request Body:", body);

    const validation = arsipHukdisSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages = validation.error.flatten().fieldErrors;
      const formattedErrors = Object.entries(errorMessages).map(([name, errors]) => `${name}: ${errors.join(', ')}`).join('; ');
      console.log("Validation failed:", formattedErrors);
      return NextResponse.json({ error: formattedErrors }, { status: 400 });
    }
    console.log("Validation successful.");

    const { namaPegawai, nip, tanggalMulaiHukuman, tanggalAkhirHukuman, keteranganHukdis, berkas } = validation.data;

    console.log("Attempting to create data in database...");
    const newArsip = await prisma.arsipHukdis.create({
      data: {
        namaPegawai,
        nip,
        tanggalMulaiHukuman: new Date(tanggalMulaiHukuman),
        tanggalAkhirHukuman: new Date(tanggalAkhirHukuman),
        keteranganHukdis,
        berkas,
      },
    });
    console.log("Successfully created data:", newArsip);

    return NextResponse.json(newArsip, { status: 201 });
  } catch (error: any) {
    console.error("!!! ERROR creating data:", error);
    return NextResponse.json({ error: `An error occurred while creating data: ${error.message}` }, { status: 500 });
  }
}