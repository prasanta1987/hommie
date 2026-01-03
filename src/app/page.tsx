
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/config';
import SignIn from './components/sign-in';
import styles from './page.module.css';

import LandingPage from './components/LandingPage'

export default function Home() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <div>
      <LandingPage />
    </div>
  );
}
