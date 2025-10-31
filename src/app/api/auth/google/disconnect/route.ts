import { NextResponse, NextRequest } from 'next/server';
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
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { googleRefreshToken: null },
        });

        return NextResponse.json({ message: 'Google account disconnected successfully.' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to disconnect Google account.' }, { status: 500 });
    }
}
