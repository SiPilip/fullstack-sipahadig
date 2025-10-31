import { NextResponse, NextRequest } from 'next/server';
import oauth2Client from '@/lib/google';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

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
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/dokumen/pengaturan?error=auth_failed', request.url));
  }

  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
        return NextResponse.redirect(new URL('/login?error=session_expired', request.url));
    }

    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (refreshToken) {
        await prisma.user.update({
            where: { id: userId },
            data: { googleRefreshToken: refreshToken },
        });
        return NextResponse.redirect(new URL('/dashboard/dokumen/pengaturan?status=google-auth-success', request.url));
    } else {
        // This happens on re-authentication if a refresh token was already issued.
        // We can just consider it a success.
        return NextResponse.redirect(new URL('/dashboard/dokumen/pengaturan?status=google-reauth-success', request.url));
    }

  } catch (error) {
    console.error('Error during Google token exchange', error);
    return NextResponse.redirect(new URL('/dashboard/dokumen/pengaturan?error=token_exchange_failed', request.url));
  }
}