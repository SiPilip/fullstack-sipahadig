import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { arsipHukdisSchema } from '@/lib/schemas';

// Common function to get ID, handles potential promise
async function getIdFromParams(params: any): Promise<string> {
    // In some Next.js versions, params can be a promise.
    // This check is for robustness.
    const resolvedParams = await Promise.resolve(params);
    return resolvedParams.id;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = await getIdFromParams(params);
    const arsip = await prisma.arsipHukdis.findUnique({
      where: { id: Number(id) },
    });

    if (!arsip) {
      return NextResponse.json({ error: 'Arsip not found' }, { status: 404 });
    }

    return NextResponse.json(arsip);
  } catch (error: any) {
    return NextResponse.json({ error: `An error occurred while fetching data: ${error.message}` }, { status: 500 });
  }
}

import { arsipHukdisSchema } from '@/lib/schemas';

// ... (existing helper and GET function)

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = await getIdFromParams(params);
    const body = await request.json();
    const validation = arsipHukdisSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }

    const { namaPegawai, nip, tanggalMulaiHukuman, tanggalAkhirHukuman, keteranganHukdis, berkas } = validation.data;

    const updatedArsip = await prisma.arsipHukdis.update({
      where: { id: Number(id) },
      data: {
        namaPegawai,
        nip,
        tanggalMulaiHukuman: new Date(tanggalMulaiHukuman),
        tanggalAkhirHukuman: new Date(tanggalAkhirHukuman),
        keteranganHukdis,
        berkas,
      },
    });

    return NextResponse.json(updatedArsip);
  } catch (error: any) {
    return NextResponse.json({ error: `An error occurred while updating data: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = await getIdFromParams(params);
    console.log("--- DELETE Request Received ---");
    console.log("Attempting to delete ID:", id);

    if (!id) {
        return NextResponse.json({ error: "ID is missing from parameters." }, { status: 400 });
    }

    await prisma.arsipHukdis.delete({
      where: { id: Number(id) },
    });

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE_ERROR", error);
    return NextResponse.json({ error: `An error occurred while deleting data: ${error.message}` }, { status: 500 });
  }
}
