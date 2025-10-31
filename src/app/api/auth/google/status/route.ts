import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

async function getVerifiedPayload(request: NextRequest): Promise<{ email: string, id: number } | null> {
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
    try {
        const payload = await getVerifiedPayload(request);
        if (!payload) {
            return NextResponse.json({ isConnected: false, error: 'Not authenticated' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (!user) {
            return NextResponse.json({ isConnected: false, error: 'User not found' }, { status: 404 });
        }

        const isConnected = !!user.googleRefreshToken;
        return NextResponse.json({ isConnected, email: user.email });

    } catch (error) {
        return NextResponse.json({ isConnected: false, error: 'Server error' }, { status: 500 });
    }
}
