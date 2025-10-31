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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
  }

  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Authentication required.', needsReAuth: true }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.googleRefreshToken) {
        return NextResponse.json({ error: 'Google account not linked or refresh token missing. Please re-authenticate.', needsReAuth: true }, { status: 401 });
    }

    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink, iconLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 100, // Fetch up to 100 files
    });

    return NextResponse.json(res.data.files);

  } catch (error: any) {
    console.error('DRIVE API ERROR:', error);
    if (error.response?.status === 401 || error.response?.status === 403) {
        return NextResponse.json({ error: 'Google Drive authentication failed. Please re-link your account.', needsReAuth: true }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch files from Google Drive.' }, { status: 500 });
  }
}