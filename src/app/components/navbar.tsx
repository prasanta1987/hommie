
'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [user] = useAuthState(auth);

  return (
    <nav className='navbar'>
      <h1>My App</h1>
      {user && (
        <div className='userInfo'>
          <span>{user.email}</span>
          <button onClick={() => signOut(auth)} className='signOutButton'>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
