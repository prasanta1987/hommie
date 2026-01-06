import { NextResponse } from 'next/server';
import admin from '../../firebase/adminConfig.js';
import { auth } from '../../firebase/config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';




export async function POST(request) {
  try {
    const body = await request.json();
    const signInUser = await signInWithEmailAndPassword(auth, body.email, body.password);

    if (signInUser) {
      return NextResponse.json({ "uid": signInUser.uid }, { status: 200 });
    } else {
      return NextResponse.json({ "error": "Wrong Credential" }, { status: 401 });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
