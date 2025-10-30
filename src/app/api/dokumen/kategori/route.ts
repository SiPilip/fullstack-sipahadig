import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const kategori = await prisma.kategoriDokumen.findMany();
    return NextResponse.json(kategori);
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to fetch document categories: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, folderId } = body;

    if (!id || !folderId) {
      return NextResponse.json({ error: 'Category ID and Folder ID are required' }, { status: 400 });
    }

    const updatedKategori = await prisma.kategoriDokumen.update({
      where: { id: Number(id) },
      data: { folderId },
    });

    return NextResponse.json(updatedKategori);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update folder ID.' }, { status: 500 });
  }
}