'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig/config';
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { Modal, Form, Button, Navbar, Nav, Container } from 'react-bootstrap';
import { FiLogOut, FiLogIn } from 'react-icons/fi';
import { CgProfile } from "react-icons/cg";
import Link from 'next/link';
import './NavBar.css'

import ArduinoCode from '../feeds/ui/ArduinoCode'

const AppNavbar = () => {
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setShowSignInModal(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateDisplayName = () => {
    updateProfile(user, {
      displayName: displayName
    }).then(() => {
      setShowProfileModal(false);
      setDisplayName('');
    }).catch((error) => {
      console.log(error);
    });
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(getFirebaseErrorMessage(error.code));
      console.error(error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    } catch (error) {
      setError(getFirebaseErrorMessage(error.code));
      console.error(error);
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSubmit = (e) => {
    if (isSignUp) {
      handleSignUp(e);
    } else {
      handleSignIn(e);
    }
  };

  return (
    <>
      <Navbar style={{ backgroundColor: '#21344f', boxShadow: '0px 2px 4px 1px #000' }} className='navbar-dark' expand="md" sticky="top">
        <Container>
          <Navbar.Brand as={Link} href="/" className='text-info'>
            {user ? ` ${displayName ? displayName : user.displayName || user.email}` : 'Hommie'}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} href="/" className="text-light">Home</Nav.Link>
              <Nav.Link as={Link} href="/feeds" className="text-light">Feeds</Nav.Link>
              <Nav.Link as={Link} href="/display" className="text-light">Display</Nav.Link>
              <Nav.Link as={Link} href="/monitor" className="text-light">Monitor</Nav.Link>
              <Nav.Link as={Link} href="/music" className="text-light">Music</Nav.Link>
            </Nav>
            <Nav>
              <div className='d-flex gap-2 align-items-center'>
                {user ? (
                  <>
                    <ArduinoCode />
                    <CgProfile
                      style={{ cursor: 'pointer' }}
                      color="#54ff9a"
                      size={28}
                      onClick={() => setShowProfileModal(true)} />
                    <FiLogOut
                      style={{ cursor: 'pointer' }}
                      color="#d42013"
                      size={28}
                      onClick={() => signOut(auth)} />
                  </>
                ) : (
                  <FiLogIn
                    style={{ cursor: 'pointer' }}
                    color="#54ff9a"
                    size={28}
                    onClick={() => setShowSignInModal(true)} />
                )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar >

      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
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
          <Button variant='secondary' onClick={() => setShowProfileModal(false)}>
            Close
          </Button>
          <Button variant='success' onClick={updateDisplayName}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSignInModal} onHide={() => setShowSignInModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton>
          <Modal.Title>{isSignUp ? 'Create an Account' : 'Sign In'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {isSignUp && (
              <Form.Group className="mb-3">
                <Form.Label>Display Name</Form.Label>
                <Form.Control
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name"
                  required
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </Form.Group>
            {error && <p className="text-danger text-center mb-3">{error}</p>}
            <div className="d-grid">
              <Button type="submit" variant='primary'>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </div>
            <p className="mt-3 text-center">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </a>
            </p>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AppNavbar;
