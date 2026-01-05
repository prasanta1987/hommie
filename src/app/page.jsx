'use client';

import { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import SignIn from './components/sign-in';
import LandingPage from './components/LandingPage';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <LandingPage />
  );
}
