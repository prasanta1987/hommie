'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FiLogOut } from 'react-icons/fi';

import ArduinoCode from './ui/ArduinoCode'

const AppNavbar = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(user);
    });

    return () => unsubscribe();
  }, []);


  return (
    <>
      <Navbar style={{ backgroundColor: '#21344f' }} className='navbar-dark' expand="md" sticky="top">
        <Container>
          <Navbar.Brand href="#home">Hi, {user ? ` ${user.displayName || user.email}` : 'Guest'}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className='gap-1'>
            <Nav className="me-auto"></Nav>
            {user && (
              <>
                <ArduinoCode />

                <FiLogOut
                  style={{ cursor: 'pointer' }}
                  color="#d42013" size={28}
                  onClick={() => signOut(auth)} />
              </>
            )}

          </Navbar.Collapse>
        </Container>
      </Navbar >
    </>
  );
};

export default AppNavbar;
