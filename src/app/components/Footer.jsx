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

    const unassignedDevices = deviceData
        ? Object.keys(deviceData)
            .map((key) => ({ id: key, ...deviceData[key] }))
            .filter((device) => device.uid == props.userData && device.allowedStat != true)
        : [];


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

    const handleDiscardDevice=()=>{
        console.log(selectedDevice.id);
        setValueToDatabase(`/nextDevice/${selectedDevice.id}`, null);

        handleCloseModal();
    }

    
    return (
        <footer style={{ boxShadow: '0px 0px 12px 0px #000000' }} className="bg-dark text-light fixed-bottom">
            {(unassignedDevices.length > 0 && props.userData) && (
                <div className='container p-2 text-center'>
                    <h5 style={{ color: '#b5b5b5' }}>Devices Waiting for Approval</h5>
                    <div className='d-flex flex-wrap justify-content-space-between'>
                        {unassignedDevices.map((device) => (
                            <Button
                                key={device.id}
                                variant='warning'
                                className='m-1 btn-sm'
                                onClick={() => handleShowModal(device)}
                            >
                                {device.deviceName || device.deviceCode}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Un-Assigned Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        selectedDevice?.deviceName && <p>Current Device Name: <strong>{selectedDevice?.deviceName}</strong></p>
                    }
                    {
                        selectedDevice?.deviceCode && <p>Current Device Code: <strong>{selectedDevice?.deviceCode}</strong></p>
                    }
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
                    <Button variant='secondary' onClick={handleDiscardDevice}>
                        Discard
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
