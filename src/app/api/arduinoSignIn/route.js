import { NextResponse } from 'next/server';
import { auth } from '../../firebase/config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    try {
      const signInUser = await signInWithEmailAndPassword(auth, email, password);
      return NextResponse.json({ uid: signInUser.user.uid }, { status: 200 });
    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
      let statusCode = 500;

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          statusCode = 400;
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials.';
          statusCode = 401;
          break;
        default:
          console.error('Firebase Auth Error:', error);
          break;
      }
      return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
