'use client'
import { Modal, Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SiArduino } from "react-icons/si";
import { useState } from 'react';

import { esp32Code, esp8266Code } from '../../miscFunctions/arduinoCode';

export default function ArduinoCode() {

    const [showModal, setShowModal] = useState(false);
    const [codeSelectedText, setCodeSelectedText] = useState('ESP32');

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
            <SiArduino
                style={{ cursor: 'pointer' }}
                className="me-2"
                color="#0ff" size={40}
                onClick={handleShowModal}
            />

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
}
