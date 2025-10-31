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

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.googleRefreshToken) {
        return NextResponse.json({ error: 'Google account not linked.' }, { status: 401 });
    }

    const { folderName, parentFolderId } = await request.json();
    if (!folderName || !parentFolderId) {
      return NextResponse.json({ error: 'Folder name and parent ID are required' }, { status: 400 });
    }

    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name',
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('CREATE FOLDER API ERROR:', error);
    return NextResponse.json({ error: 'Failed to create folder in Google Drive.' }, { status: 500 });
  }
}
