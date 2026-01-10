'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Modal, Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FiLogOut } from 'react-icons/fi';
import { SiArduino } from "react-icons/si";
import { esp32Code, esp8266Code } from '../miscFunctions/arduinoCode';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AppNavbar = () => {

  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [codeSelectedText, setCodeSelectedText] = useState('ESP32');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleShowModal = (device) => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const codeSelected = (code) => {
    setCodeSelectedText(code);
  }


  const handleCopyCode = () => {

    let variableData = codeSelectedText == 'ESP32' ? esp32Code : esp8266Code

    navigator.clipboard.writeText(variableData).then(() => {
      setShowModal(false);;
    }).catch(err => {
      alert('Could not copy text: ', err);
    })
  }

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
                <SiArduino
                  style={{ cursor: 'pointer' }}
                  className="me-2"
                  color="#0ff" size={40}
                  onClick={handleShowModal}
                />

                <FiLogOut
                  style={{ cursor: 'pointer' }}
                  color="#d42013" size={28}
                  onClick={() => signOut(auth)} />
              </>
            )}

          </Navbar.Collapse>
        </Container>
      </Navbar >

      <Modal show={showModal} fullscreen={true} onHide={handleCloseModal} centered data-bs-theme="dark">
        <Modal.Header closeButton>
          <Modal.Title>Arduino Configuration for {codeSelectedText}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SyntaxHighlighter language="arduino" style={vscDarkPlus}>
            {codeSelectedText == 'ESP32' ? esp32Code : esp8266Code}
          </SyntaxHighlighter>
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant='secondary' onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant='success' onClick={handleCopyCode}>
            Copy Code
          </Button>
          <div className='d-flex gap-3'>
            <Button variant='primary' onClick={() => codeSelected('ESP8266')}>
              ESP8266
            </Button>
            <Button variant='primary' onClick={() => codeSelected('ESP32')}>
              ESP32
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default AppNavbar;
