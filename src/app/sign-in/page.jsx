'use client';

import { redirect } from 'next/navigation';
import SignIn from '@/app/components/sign-in';
import { Spinner } from 'react-bootstrap';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';

export default function SignInPage() {

  const { user, loading} = useAuth();

  if (loading) {
    return <div className='d-flex justify-content-center align-items-center vh-100'><Spinner /></div>;
  }

  if (user) {
    redirect('/');
  }

  return <SignIn />;
}
