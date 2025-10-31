import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { arsipHukdisSchema } from '@/lib/schemas';

function convertGoogleDriveLink(url: string): string {
    const regex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keterangan = searchParams.get('keterangan');
    const status = searchParams.get('status');
    let where: any = {};

    if (keterangan) {
      where.keteranganHukdis = keterangan;
    }

    if (status === 'aktif') {
      where.tanggalAkhirHukuman = { gte: new Date() };
    } else if (status === 'selesai') {
      where.tanggalAkhirHukuman = { lt: new Date() };
    }

    const arsip = await prisma.arsipHukdis.findMany({ where });
    return NextResponse.json(arsip);
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to fetch arsip data: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = arsipHukdisSchema.safeParse(body);

    if (!validation.success) {
      const formattedErrors = Object.entries(validation.error.flatten().fieldErrors).map(([name, errors]) => `${name}: ${errors?.join(', ') || 'Invalid'}`).join('; ');
      return NextResponse.json({ error: formattedErrors }, { status: 400 });
    }

    const { namaPegawai, nip, tanggalMulaiHukuman, tanggalAkhirHukuman, keteranganHukdis, berkas } = validation.data;
    const embeddableLink = convertGoogleDriveLink(berkas);

    const newArsip = await prisma.arsipHukdis.create({
      data: {
        namaPegawai,
        nip,
        tanggalMulaiHukuman: new Date(tanggalMulaiHukuman),
        tanggalAkhirHukuman: new Date(tanggalAkhirHukuman),
        keteranganHukdis,
        berkas: embeddableLink,
      },
    });

    return NextResponse.json(newArsip, { status: 201 });
  } catch (error: any) {
    console.error("!!! ERROR creating data:", error);
    return NextResponse.json({ error: `An error occurred while creating data: ${error.message}` }, { status: 500 });
  }
}