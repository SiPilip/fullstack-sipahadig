import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'your-default-secret-key';
    const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '8h' });

    const response = NextResponse.json({ message: 'Login successful' });

    response.headers.set('Set-Cookie', 
      `sipahadig-token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Lax`
    );

    return response;

  } catch (error: any) {
    console.error("LOGIN API ERROR:", error);
    return new NextResponse(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500 });
  }
}
