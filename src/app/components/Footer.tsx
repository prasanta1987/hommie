
'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Footer = () => {
  const [user] = useAuthState(auth);

  return (
    <></>
  );
};

export default Footer;


