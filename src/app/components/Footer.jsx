'use client'
import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import { useObjectVal } from 'react-firebase-hooks/database';
import { ref } from 'firebase/database';
import { db } from '../firebase/config'
import { Spinner } from 'react-bootstrap';

import { setValueToDatabase, updateValuesToDatabase } from '../miscFunctions/actions';

const Footer = (props) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deviceName, setDeviceName] = useState('');

    const [deviceData, dataLoading, dataError] = useObjectVal(props.userData ? ref(db, "nextDevice") : null);


    console.log(deviceData);

    const unassignedDevices = deviceData
        ? Object.keys(deviceData)
            .map((key) => ({ id: key, ...deviceData[key] }))
            .filter((device) => device.uid == props.userData && device.allowedStat != true)
        : [];

    console.log(unassignedDevices);

    const handleShowModal = (device) => {
        setSelectedDevice(device);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDevice(null);
        setDeviceName('');
    };

    const handleDeviceNameChange = (e) => {
        setDeviceName(e.target.value);
    };

    const handleSaveDeviceName = () => {

        updateValuesToDatabase(`/nextDevice/${selectedDevice.id}`, {
            deviceName: (deviceName !== '' ? deviceName : selectedDevice.deviceName || selectedDevice.deviceCode),
            allowedStat: true,
            uid: null
        });

        handleCloseModal();
    };

    return (
        <footer className="bg-dark text-light p-2 text-center sticky-bottom">
            {(unassignedDevices.length > 0 && props.userData) && (
                <footer className='fixed-bottom text-white bg-dark p-3'>
                    <div className='container'>
                        <h5>Unassigned Devices</h5>
                        <div className='d-flex flex-wrap justify-content-space-between'>
                            {unassignedDevices.map((device) => (
                                <Button
                                    key={device.id}
                                    // variant='outline-light'
                                    className='m-1 bg-primary'
                                    onClick={() => handleShowModal(device)}
                                >
                                    {device.deviceName || device.deviceCode}
                                </Button>
                            ))}
                        </div>
                    </div>
                </footer>
            )}

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Set Device Name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Current Device: <strong>{selectedDevice?.deviceName || selectedDevice?.deviceCode}</strong>
                    </p>
                    <Form.Group controlId='formDeviceName'>
                        <Form.Label>New Device Name</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder="Enter New Device Name"
                            value={deviceName}
                            onChange={handleDeviceNameChange}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant='primary' onClick={handleSaveDeviceName}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </footer>
    );
}

export default Footer;
