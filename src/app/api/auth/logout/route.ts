import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({ message: 'Logout successful' });

  // Invalidate the cookie by setting its Max-Age to 0
  response.headers.set('Set-Cookie', 
    `sipahadig-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );

  return response;
}