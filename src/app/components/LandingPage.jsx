'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { SiArduino } from "react-icons/si";
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from "firebase/database";
import { Spinner } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Boards from '../ui/Boards';
import Feeds from '../ui/Feeds';
import { Container } from 'react-bootstrap';
import { Modal, Button, Form } from 'react-bootstrap';
import { esp32Imports, esp32Code, esp8266Imports, esp8266Code } from '../miscFunctions/arduinoCode';
import { setValueToDatabase, updateValuesToDatabase } from '../miscFunctions/actions';
import './LandingPage.css'

const LandingPage = (props) => {

  const [userUid, setUserUid] = useState(null);
  const [dbData, setDBData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [codeSelectedText, setCodeSelectedText] = useState('ESP32');

  const boardSelection = (devCode, devFeed) => {
    const feedStatus = dbData[devCode].devFeeds[devFeed].isSelected;
    updateValuesToDatabase(`${userUid}/${devCode}/devFeeds/${devFeed}`, { "isSelected": !feedStatus });
  }

  useEffect(() => {

    if (props.userData) {
      setUserUid(props.userData.uid);
      setDBData(props.userDbData);
    } else {
      setUserUid(null);
      setDBData(null);
    }
  }, [props.userData, props.userDbData]);

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
    <Container fluid className='bg-dark text-light flex-grow-1 overflow-auto pb-5'>
      <Container className='d-flex justify-content-between align-items-center pt-2'>
        <div className='d-flex justify-content-start gap-3 align-items-center flex-wrap'>
          {
            (userUid) ?
              (dbData)
                ? Object.keys(dbData).map(data => {
                  return (
                    <Boards
                      key={data}
                      boardKey={data}
                      sendSelectedBoard={boardSelection}
                      boardData={dbData[data]}
                      uid={userUid}
                    />
                  )
                })
                : "None"
              : "None"
          }
        </div>
        {
          (userUid) && <div><SiArduino style={{ cursor: 'pointer' }} color="#0ff" size={40} onClick={handleShowModal} /></div>
        }


      </Container>
      <Container className='d-flex justify-content-start gap-3 pt-2'>
        {dbData && <Feeds feedData={dbData} />}
      </Container>

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

    </Container>

  );
};

export default LandingPage;
