
'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const LandingPage = () => {
  const [user] = useAuthState(auth);

  return (
    <div className='container flex-grow-1 overflow-auto'>
      <h1>{user ? user.email : 'Guest'}</h1>
    </div>
  );
};

export default LandingPage;


