import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';
import oauth2Client from '@/lib/google';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { Readable } from 'stream';

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderId = formData.get('folderId') as string | null;

    if (!file || !folderId) {
      return NextResponse.json({ error: 'File and Folder ID are required' }, { status: 400 });
    }

    // Check for optional data for dynamic naming
    const namaPegawai = formData.get('namaPegawai') as string | null;
    const nip = formData.get('nip') as string | null;
    const tanggalMulai = formData.get('tanggalMulai') as string | null;

    let finalFileName = file.name; // Default to original filename

    // If all required data for dynamic naming is present, create the new name
    if (namaPegawai && nip && tanggalMulai) {
        const date = new Date(tanggalMulai);
        const formattedDate = `${date.getDate()}${[ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ][date.getMonth()]}`;
        const fileExtension = file.name.split('.').pop();
        finalFileName = `${namaPegawai}_${nip}_${formattedDate}.${fileExtension}`;
    }

    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileBuffer = await file.arrayBuffer();
    const readableStream = new Readable();
    readableStream.push(Buffer.from(fileBuffer));
    readableStream.push(null);

    const response = await drive.files.create({
        requestBody: {
            name: finalFileName, // Use the final determined name
            parents: [folderId],
        },
        media: {
            mimeType: file.type,
            body: readableStream,
        },
        fields: 'id,name,webViewLink',
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('UPLOAD API ERROR:', error);
    return NextResponse.json({ error: 'Failed to upload file to Google Drive.' }, { status: 500 });
  }
}
