'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { redirect } from 'next/navigation';
import SignIn from '../components/sign-in';
import { Spinner } from 'react-bootstrap';

export default function SignInPage() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className='d-flex justify-content-center align-items-center vh-100'><Spinner /></div>;
  }

  if (user) {
    redirect('/');
  }

  return <SignIn />;
}
