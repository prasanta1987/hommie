import { NextResponse } from 'next/server';
// Import the client-side db instance and functions
import { db } from '../../firebase/config.js';
import { ref, get } from 'firebase/database';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config.js';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const dataRef = ref(db, path);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.val(), { status: 200 });
    } else {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data. Check security rules.', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const signInUser = await signInWithEmailAndPassword(auth, email, password);

    if (signInUser) {
      return NextResponse.json({ "uid": signInUser.user.uid }, { status: 200 });
    } else {
      return NextResponse.json({ "msg": "Wrong Creds" }, { status: 401 });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Failed to authenticate', details: error.message }, { status: 401 });
  }
}