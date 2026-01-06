'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FiLogOut } from 'react-icons/fi';

const AppNavbar = () => {
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Navbar bg="light" expand="md" sticky="top">
      <Container>
        <Navbar.Brand href="#home">Hi, {user ? ` ${user.displayName || user.email}` : 'Guest'}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto"></Nav>
          {user && (
            <Button variant="outline-danger" onClick={() => signOut(auth)}>
              <FiLogOut className="me-2" /> Log Out
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
