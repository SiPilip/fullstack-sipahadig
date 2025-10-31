import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { arsipHukdisSchema } from '@/lib/schemas';
import { google } from 'googleapis';
import oauth2Client from '@/lib/google';
import { jwtVerify } from 'jose';

// This is the context type that the Next.js build process expects.
interface RouteContext {
    params: Promise<{ id: string }>;
}

// Helper to get user ID from JWT
async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
    const token = request.cookies.get('sipahadig-token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        return (payload as { id: number }).id;
    } catch (err) {
        return null;
    }
}

// Helper to extract File ID from Google Drive URL
function getFileIdFromUrl(url: string): string | null {
    const regex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function convertGoogleDriveLink(url: string): string {
    const fileId = getFileIdFromUrl(url);
    if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
}

// --- ROUTE HANDLERS ---

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: idString } = await params;
    const id = Number(idString);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const arsip = await prisma.arsipHukdis.findUnique({ where: { id } });
    if (!arsip) return NextResponse.json({ error: "Arsip not found" }, { status: 404 });
    
    return NextResponse.json(arsip);
  } catch (error: any) {
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: idString } = await params;
    const id = Number(idString);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const validation = arsipHukdisSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid validation" }, { status: 400 });
    }

    const { berkas, ...restOfData } = validation.data;
    const embeddableLink = convertGoogleDriveLink(berkas);

    const updatedArsip = await prisma.arsipHukdis.update({
      where: { id },
      data: { ...restOfData, berkas: embeddableLink },
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
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const arsip = await prisma.arsipHukdis.findUnique({ where: { id } });
    if (!arsip) return NextResponse.json({ error: "Arsip not found" }, { status: 404 });

    const fileId = getFileIdFromUrl(arsip.berkas);
    if (fileId) {
        const userId = await getUserIdFromToken(request);
        const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
        if (user && user.googleRefreshToken) {
            oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            await drive.files.delete({ fileId: fileId });
        }
    }

    await prisma.arsipHukdis.delete({ where: { id } });
    return new Response(null, { status: 204 });

  } catch (error: any) {
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}