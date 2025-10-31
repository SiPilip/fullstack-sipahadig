import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { arsipHukdisSchema } from '@/lib/schemas';

// This is the context type that the Next.js build process expects.
interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Await the promise to get the actual params object
    const { id: idString } = await params;
    const id = Number(idString);

    const arsip = await prisma.arsipHukdis.findUnique({ where: { id } });

    if (!arsip) {
      return NextResponse.json({ error: "Arsip not found" }, { status: 404 });
    }
    return NextResponse.json(arsip);
  } catch (error: any) {
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: idString } = await params;
    const id = Number(idString);

    const body = await request.json();
    const validation = arsipHukdisSchema.safeParse(body);

    if (!validation.success) {
      const formattedErrors = Object.entries(validation.error.flatten().fieldErrors).map(([name, errors]) => `${name}: ${errors?.join(', ') || 'Invalid'}`).join('; ');
      return NextResponse.json({ error: formattedErrors }, { status: 400 });
    }

    const { namaPegawai, nip, tanggalMulaiHukuman, tanggalAkhirHukuman, keteranganHukdis, berkas } = validation.data;

    const updatedArsip = await prisma.arsipHukdis.update({
      where: { id },
      data: { namaPegawai, nip, tanggalMulaiHukuman: new Date(tanggalMulaiHukuman), tanggalAkhirHukuman: new Date(tanggalAkhirHukuman), keteranganHukdis, berkas },
    });

    return NextResponse.json(updatedArsip);
  } catch (error: any) {
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: idString } = await params;
    const id = Number(idString);

    if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid ID format." }, { status: 400 });
    }

    await prisma.arsipHukdis.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}
