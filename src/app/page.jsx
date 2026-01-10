'use client';

import { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import SignIn from './components/sign-in';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { ref } from 'firebase/database';

import LandingPage from './components/LandingPage';
import Footer from './components/Footer';
import NoBoard from './components/ui/NoBoard';


export default function Home() {

  const [user, loading, error] = useAuthState(auth);
  const [dbData, dataLoading, dataError] = useObjectVal(user ? ref(db, user.uid) : null);

  console.log(dbData);
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
        {
          dbData
            ? <LandingPage userDbData={dbData} userData={user} />
            : <NoBoard />
        }

        <Footer userData={user.uid} />
      </>
    );
  }

  return <SignIn />;
}
