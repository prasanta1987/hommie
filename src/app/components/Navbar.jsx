'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { Modal, Form, Button, Navbar, Nav, Container } from 'react-bootstrap';
import { FiLogOut } from 'react-icons/fi';
import { CgProfile } from "react-icons/cg";
import Link from 'next/link';

import ArduinoCode from './ui/ArduinoCode'

const AppNavbar = () => {

  const [user, setUser] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const updateDisplayName = () => {

    updateProfile(user, {
      displayName: displayName
    }).then(() => {
      setShowModal(false);
      setDisplayName('');
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <>
      <Navbar style={{ backgroundColor: '#21344f', boxShadow: '0px 2px 4px 1px #000' }} className='navbar-dark' expand="md" sticky="top">
        <Container className='d-flex'>
          <Navbar.Brand className='text-info'>
            {user ? ` ${displayName ? displayName : user.displayName || user.email}` : 'Guest'}
          </Navbar.Brand>
          <Nav className="gap-3 align-items-center flex-row">
            <Nav.Link as={Link} href="/" className="text-light">Home</Nav.Link>
            <Nav.Link as={Link} href="/display" className="text-light">Display</Nav.Link>
            {user && (
              <>
                <ArduinoCode />

                <CgProfile
                  style={{ cursor: 'pointer' }}
                  color="#54ff9a"
                  size={28}
                  onClick={() => setShowModal(true)} />

                <FiLogOut
                  style={{ cursor: 'pointer' }}
                  color="#d42013"
                  size={28}
                  onClick={() => signOut(auth)} />

              </>
            )}
          </Nav>
        </Container>
      </Navbar >

      <Modal show={showModal} fullscreen={false} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBoardName">
              <Form.Label>Enter Display Name</Form.Label>
              <Form.Control
                type="text"
                placeholder={user && user.displayName}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant='success' onClick={() => updateDisplayName()}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>


    </>
  );
};

export default AppNavbar;
