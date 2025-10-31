import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';
import oauth2Client from '@/lib/google';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

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

export async function POST(request: NextRequest) { // Using POST to have a body
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.googleRefreshToken) {
        return NextResponse.json({ error: 'Google account not linked.' }, { status: 401 });
    }

    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    await drive.files.delete({ fileId: fileId });

    return new Response(null, { status: 204 }); // Success, no content

  } catch (error: any) {
    console.error('DELETE ITEM API ERROR:', error);
    // Check if it's an insufficient permissions error
    if (error.code === 403) {
        return NextResponse.json({ error: 'Aplikasi tidak memiliki izin untuk menghapus file/folder ini. Mungkin file ini tidak dibuat oleh aplikasi.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to delete item from Google Drive.' }, { status: 500 });
  }
}
