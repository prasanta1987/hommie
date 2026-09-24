import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeAllSessions } from '@/firebaseAdmin/config';

export async function POST() {
  const sessionCookie = cookies().get('__session')?.value;
  if (sessionCookie) {
    await revokeAllSessions(sessionCookie);
    cookies().delete('__session');
  }

  return NextResponse.json({ status: 'success' }, { status: 200 });
}
