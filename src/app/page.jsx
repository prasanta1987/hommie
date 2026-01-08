'use client';

import { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import SignIn from './components/sign-in';
import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { ref } from 'firebase/database';

export default function Home() {

  const [user, loading, error] = useAuthState(auth);
  const [dbData, dataLoading, dataError] = useObjectVal(user ? ref(db, user.uid) : null);


  if (loading || dataLoading) {
    return <div>Loading...</div>;
  }

  if (error || dataError) {
    return <div>Error: {error?.message || dataError?.message}</div>
  }

  if (!user) {
    return <SignIn />;
  }

  if (user) {
    return (
      <>
        <LandingPage userDbData={dbData} userData={user} />
        <Footer userData={user.uid}/>
      </>
    );
  }

  return <SignIn />;
}
