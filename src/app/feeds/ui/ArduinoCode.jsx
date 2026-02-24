'use client'
import { Modal, Navbar, Tabs, Tab, Nav, Container, Button } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SiArduino } from "react-icons/si";
import { useState } from 'react';

import {
    esp32Imports, esp32Code, esp32Class,
    esp8266Imports, esp8266Code, esp8266Class
} from '@/app/miscFunctions/arduinoCode';

export default function ArduinoCode({ apiKey }) {

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

        let variableData = codeSelectedText == 'ESP32'
            ? `${esp32Imports}+${esp32Code}+${esp32Class}`
            : `${esp8266Imports}+${esp8266Code}+${esp8266Class}`

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
                color="#0ff" size={40}
                onClick={handleShowModal}
            />

            <Modal show={showModal} fullscreen={true} onHide={handleCloseModal} centered data-bs-theme="dark">
                <Modal.Header closeButton>
                    <Modal.Title>Arduino Configuration for {codeSelectedText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs
                        defaultActiveKey="SSE"
                        id="uncontrolled-tab-example"
                        className="mb-3 d-flex flex-row"
                        justify
                        fill
                    >
                        <Tab className="w-100" eventKey="SSE" title="SSE">
                            <SyntaxHighlighter language="arduino" style={vscDarkPlus}>
                                {codeSelectedText === 'ESP32'
                                    ? `${esp32Imports}\n#define apiKey = "${apiKey}";${esp32Code}`
                                    : `${esp8266Imports}\n#define apiKey = "${apiKey}";${esp8266Code}`
                                }
                            </SyntaxHighlighter>
                        </Tab>
                        <Tab className="w-100" eventKey="Data Send" title="Hommily.h">
                            <SyntaxHighlighter language="arduino" style={vscDarkPlus}>
                                {codeSelectedText === 'ESP32'
                                    ? esp32Class
                                    : "Coming Soon"
                                }
                            </SyntaxHighlighter>
                        </Tab>
                    </Tabs>
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
