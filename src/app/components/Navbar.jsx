'use client';

import React, { useState, useEffect, use } from 'react';
import { auth } from '@/firebaseConfig/config';
import { usePathname } from 'next/navigation';
import {
  signOut,
  updateProfile,
} from 'firebase/auth';
import { Modal, Form, Button, Navbar, Nav, Container } from 'react-bootstrap';
import { FiLogOut, FiLogIn } from 'react-icons/fi';
import { CgProfile } from "react-icons/cg";
import Link from 'next/link';
import { regenerateApiKey } from '@/app/miscFunctions/actions';
import './NavBar.css'
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';
import SingInModal from '@/app/components/ui/signInModal';
import { updateValuesToDatabase } from '@/app/miscFunctions/actions';

import ArduinoCode from '@/app/feeds/ui/ArduinoCode'

const AppNavbar = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [apiKeyBTN, setIsApiKeyBTN] = useState(true);
  const [userDelMode, setUserDelMode] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { data: apiKey, loading: dataLoading } = useRTDB(
    user ? `userCred/UIDtoAPI/${user.uid}/fbAPIKey` : null
  );

  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email);
      setShowSignInModal(false);
    } else {
      setDisplayName('');
    }
  }, [user]);



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


  const deleteUserAccount = async (user, apiKey) => {


    if (!user) return;

    if (apiKey) {
      const uid = user.uid;

      const multiUpdate = {};
      multiUpdate[`userCred/UIDtoAPI/${uid}`] = null;
      multiUpdate[`userCred/APItoUID/${apiKey}`] = null;
      multiUpdate[uid] = null;

      await updateValuesToDatabase(`/`, multiUpdate);
    }

    try {

      await user.delete();

    }
    catch (error) {
      setUserDelMode(true);
      setShowSignInModal(true);
    }
  };


  return (
    <>
      <Navbar style={{ backgroundColor: '#21344f', boxShadow: '0px 2px 4px 1px #000' }} className='navbar-dark' expand="md" sticky="top">
        <Container>
          <Navbar.Brand as={Link} href="/" className='dpName'>
            {user ? ` ${displayName ? displayName : user.displayName || user.email}` : 'Hommie'}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} href="/" className="text-light">Home</Nav.Link>
              {user && <Nav.Link as={Link} href="/feeds" className="text-light">Feeds</Nav.Link>}
              {user && <Nav.Link as={Link} href="/display" className="text-light">Display</Nav.Link>}
              {user && <Nav.Link as={Link} href="/photos" className="text-light">Photos</Nav.Link>}
              {user && <Nav.Link as={Link} href="/quiz" className="text-light">Quizzes</Nav.Link>}
              <Nav.Link as={Link} href="/drawing" className="text-light">Drawing</Nav.Link>
              {pathname === '/drawing'&& <Nav.Link as={Link} href="/drawing/colour" className="text-light">TFT Colour</Nav.Link>}
              {pathname === '/drawing'&& <Nav.Link as={Link} href="/drawing/tft" className="text-light">TFT_eSPI</Nav.Link>}
              <Nav.Link as={Link} href="/music" className="text-light">Music</Nav.Link>
            </Nav>
            <Nav>
              <div className='d-flex gap-2 align-items-center'>
                {user ? (
                  <>
                    <ArduinoCode apiKey={apiKey} />
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

            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="text"
                disabled
                value={apiKey}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <button
                className='btn btn-sm btn-warning mt-2'
                onClick={(e) => {
                  e.preventDefault();
                  regenerateApiKey(apiKey, setIsApiKeyBTN, user);
                }}
                disabled={apiKeyBTN}
              >
                Generate New API Key
              </button>

            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='danger' onClick={(e) => {
            e.preventDefault();
            deleteUserAccount(user, apiKey, setShowProfileModal);
          }}>
            Delete Account
          </Button>
          <Button variant='success' onClick={updateDisplayName}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <SingInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
        userDelMode={userDelMode}
      />

    </>
  );
};

export default AppNavbar;
