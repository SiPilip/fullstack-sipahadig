import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import oauth2Client from '@/lib/google';

// This is a placeholder. In a real app, you'd get the user's saved tokens.
// For now, we'll assume the client has tokens (this will fail).
// We need to complete the auth flow to make this work.
const FAKE_USER_TOKENS = {
  access_token: 'fake_access_token',
  refresh_token: 'fake_refresh_token',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
  }

  try {
    // This will fail until we properly store and retrieve user tokens
    oauth2Client.setCredentials(FAKE_USER_TOKENS);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, modifiedTime, webViewLink, iconLink)',
      orderBy: 'modifiedTime desc',
    });

    return NextResponse.json(res.data.files);

  } catch (error: any) {
    console.error('DRIVE API ERROR:', error);
    // Provide a more helpful error if it's an auth issue
    if (error.response?.status === 401 || error.response?.status === 403) {
        return NextResponse.json({ error: 'Google Drive authentication failed. Please re-authenticate.', needsReAuth: true }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch files from Google Drive.' }, { status: 500 });
  }
}
