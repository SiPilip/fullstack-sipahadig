import { NextResponse, NextRequest } from 'next/server';
import oauth2Client from '@/lib/google';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// This is a simplified version. In production, you'd want to handle token storage securely.
async function getVerifiedPayload(request: NextRequest) {
    const token = request.cookies.get('sipahadig-token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        return payload as { email: string, id: number };
    } catch (err) {
        return null;
    }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', request.url));
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // In a real app, you would associate these tokens with the logged-in user in your database.
    // For now, we'll store the refresh token (if available) in a new JWT or session.
    // This is a simplified flow.
    console.log('Google Tokens Acquired:', tokens);

    // For simplicity, we'll just redirect to a success page.
    // A real implementation would store the tokens securely.
    return NextResponse.redirect(new URL('/dashboard/dokumen/pengaturan?status=google-auth-success', request.url));

  } catch (error) {
    console.error('Error acquiring Google tokens', error);
    return NextResponse.redirect(new URL('/dashboard?error=google_token_exchange_failed', request.url));
  }
}
