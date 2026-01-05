import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';

export async function GET() {
  try {
    const db = admin.database();
    const ref = db.ref('playlist');
    const snapshot = await ref.once('value');
    const data = snapshot.val();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
