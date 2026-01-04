import { NextResponse } from 'next/server';
import admin from '@/app/firebase/adminConfig';

// GET request handler
export async function GET() {
  try {
    const db = admin.database();
    const ref = db.ref('test');
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST request handler
export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    const db = admin.database();
    const ref = db.ref('test');
    await ref.set(data);

    return new NextResponse('Data saved successfully', { status: 200 });
  } catch (error) {
    console.error('Error saving data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
