
import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';
import { auth } from '../../firebase/config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';



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


export async function POST(request) {
  try {
    const body = await request.json();
    const signInUser = await signInWithEmailAndPassword(auth, body.email, body.password);

    if (signInUser) {
      return NextResponse.json({ "msg": signInUser.user.uid }, { status: 200 });
    } else {
      return NextResponse.json({ "msg": "Wrong Cred" }, { status: 200 });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
