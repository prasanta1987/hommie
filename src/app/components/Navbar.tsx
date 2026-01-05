
'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [user] = useAuthState(auth);

  return (
    <nav data-bs-theme="light" className="sticky-top navbar navbar-expand-md navbar-light bg-light">
      <div className="container">
        <a href="#home" className="navbar-brand">Hi, {user ? ` ${user.displayName || user.email}` : 'Guest'}</a>
        <button aria-controls="basic-navbar-nav" type="button" aria-label="Toggle navigation" className="navbar-toggler collapsed">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="navbar-collapse collapse" id="basic-navbar-nav">
          <div className="me-auto navbar-nav"></div>
          {
            user && <button type="button" onClick={() => signOut(auth)} className="btn btn-outline-danger">Log Out</button>
          }

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
