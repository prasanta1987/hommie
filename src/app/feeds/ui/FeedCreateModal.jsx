import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FeedTypes from './FeedTypes';
import { mcuTypes } from '@/app/miscFunctions/espSafeGPIOs';
import { updateValuesToDatabase } from '@/app/miscFunctions/actions';


export default function FeedModal({
    isOpen, setShowModal, devices, uid, selectedDeviceCode
}) {

    const [feedName, setFeedName] = useState('');
    const [feedType, setFeedType] = useState('Card');
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(100);
    const [mcuType, setMcuType] = useState('ESP32');
    const [GPIO, setGPIO] = useState(0);
    const [rPIN, setRPIN] = useState(0);
    const [gPIN, setGPIN] = useState(0);
    const [bPIN, setBPIN] = useState(0);

    const [pinDescription, setPinDescription] = useState('');
    const currentSafePins = mcuTypes[mcuType || "ESP8266"].safeGPIOs;

    if (!isOpen) return null;


    const handleCreateFeed = () => {

        if (!feedName) {
            alert("Feed name is required.");
            return;
        }
        const reference = `${uid}/${selectedDeviceCode}/devFeeds/${feedName}`;
        const newFeed = {
            type: feedType,
            value: 0,
            time: new Date().getTime(),
            isSelected: true
        };

        if (feedType === 'Gauge' || feedType === 'Slider') {
            newFeed.rangeMin = parseFloat(minValue);
            newFeed.rangeMax = parseFloat(maxValue);
        }

        if (feedType === 'Toggle') {
            if (GPIO == 0) {
                alert("GPIO must be a number.");
                return;
            }
            newFeed.GPIO = parseInt(GPIO);
            newFeed.value = 0;
            newFeed.mcu = mcuType;
        }

        if (feedType === 'Colour') {
            if (rPIN == 0 || gPIN == 0 || bPIN == 0) {
                alert("PINs must be numbers.");
                return;
            }
            newFeed.rPIN = parseInt(rPIN);
            newFeed.gPIN = parseInt(gPIN);
            newFeed.bPIN = parseInt(bPIN);
            newFeed.mcu = mcuType;
            newFeed.value = "#2576b9";
        }

        updateValuesToDatabase(reference, newFeed);

        // Reset form fields
        setFeedName('');
        setFeedType('Card');
        setMinValue(0);
        setMaxValue(100);
        setShowModal(false);
    }

    return (
        <Modal show={isOpen} onHide={setShowModal} centered data-bs-theme="dark" size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>
                    Create New Feed
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>

                    <Form.Group className="mb-3">
                        <Form.Label>Device</Form.Label>
                        <Form.Select
                            value={selectedDeviceCode}
                            onChange={(e) => setSelectedDeviceCode(e.target.value)}
                        >
                            {devices.map((device) => (
                                <option key={device.deviceCode} value={device.deviceCode}>
                                    {device.deviceName} ({device.deviceCode})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>



                    <Form.Group className="mb-3">
                        <Form.Label>Feed Name</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            placeholder="Enter feed name"
                            value={feedName}
                            onChange={(e) => setFeedName(e.target.value)}
                        />
                    </Form.Group>


                    <Form.Group className="mb-3">
                        <Form.Label>Select Feed Type</Form.Label>
                        <FeedTypes
                            feedType={feedType}
                            setFeedType={setFeedType}
                        />
                    </Form.Group>

                    {(feedType === 'Gauge' || feedType === 'Slider') && (
                        <div className='d-flex gap-5'>
                            <Form.Group className="mb-3">
                                <Form.Label>Min Value</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={minValue}
                                    onChange={(e) => setMinValue(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Max Value</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={maxValue}
                                    onChange={(e) => setMaxValue(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                    )}

                    {(feedType === 'Toggle') && (

                        <div className='gap-2 justify-content-between align-items-end d-flex'>
                            <Form.Group className="w-100 mb-3">
                                <Form.Label>Select Microcontroller</Form.Label>
                                <Form.Select
                                    value={mcuType}
                                    onChange={(e) => {
                                        setMcuType(e.target.value);
                                        setGPIO(''); // Reset pin selection on MCU change
                                    }}
                                >
                                    {Object.keys(mcuTypes).map((key) => (
                                        <option key={key} value={key}>
                                            {mcuTypes[key].name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {/* Dynamic GPIO Dropdown (mapping objects) */}
                            <Form.Group className="w-100 mb-3">
                                <Form.Label>Select {mcuTypes[mcuType || "ESP8266"].name} GPIO Pin</Form.Label>
                                <Form.Select
                                    value={GPIO}
                                    onChange={
                                        (e) => {
                                            setGPIO(e.target.value)
                                            const selectedOption = e.target.selectedOptions[0];
                                            const description = selectedOption.getAttribute("desc");
                                            setPinDescription(description);
                                        }
                                    }
                                >
                                    <option value="">-- Choose a Pin --</option>
                                    {currentSafePins.map((pin) => (
                                        <option key={pin.value} value={pin.value} desc={pin.desc}>
                                            {pin.name} (GPIO {pin.value})
                                        </option>
                                    ))}
                                </Form.Select>
                                {/* <Form.Label>{pinDescription}</Form.Label> */}
                            </Form.Group>

                        </div>
                    )}

                    {(feedType === 'Colour') && (
                        <>
                            <div className='gap-2 justify-content-between d-flex'>
                                <Form.Group className="w-100 mb-3">
                                    <Form.Label>Select Microcontroller</Form.Label>
                                    <Form.Select
                                        value={mcuType}
                                        onChange={(e) => {
                                            setMcuType(e.target.value);
                                            setGPIO(''); // Reset pin selection on MCU change
                                        }}
                                    >
                                        {Object.keys(mcuTypes).map((key) => (
                                            <option key={key} value={key}>
                                                {mcuTypes[key].name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className='d-flex justify-content-between gap-1 text-center mb-3'>
                                <div className='d-flex flex-column w-100'>
                                    <Form.Label>Select Red PIN</Form.Label>
                                    <Form.Select
                                        value={rPIN}
                                        onChange={(e) => {
                                            setRPIN(e.target.value)
                                            const selectedOption = e.target.selectedOptions[0];
                                            const description = selectedOption.getAttribute("desc");
                                            setPinDescription(description);
                                        }}
                                    >
                                        <option value="">-- Choose a Pin --</option>
                                        {currentSafePins.map((pin) => (
                                            <option key={pin.value} value={pin.value} desc={pin.desc}>
                                                {pin.name} (GPIO {pin.value})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <div className='d-flex flex-column w-100'>
                                    <Form.Label>Select Green PIN</Form.Label>
                                    <Form.Select
                                        value={gPIN}
                                        onChange={(e) => {
                                            setGPIN(e.target.value)
                                            const selectedOption = e.target.selectedOptions[0];
                                            const description = selectedOption.getAttribute("desc");
                                            setPinDescription(description);
                                        }}
                                    >
                                        <option value="">-- Choose a Pin --</option>
                                        {currentSafePins.map((pin) => (
                                            <option key={pin.value} value={pin.value} desc={pin.desc}>
                                                {pin.name} (GPIO {pin.value})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div className='d-flex flex-column w-100'>
                                    <Form.Label>Select Blue PIN</Form.Label>
                                    <Form.Select
                                        value={bPIN}
                                        onChange={(e) => {
                                            setBPIN(e.target.value)
                                            const selectedOption = e.target.selectedOptions[0];
                                            const description = selectedOption.getAttribute("desc");
                                            setPinDescription(description);
                                        }}
                                    >
                                        <option value="">-- Choose a Pin --</option>
                                        {currentSafePins.map((pin) => (
                                            <option key={pin.value} value={pin.value} desc={pin.desc}>
                                                {pin.name} (GPIO {pin.value})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>

                            </div>
                        </>

                    )}
                </Form>
                <small>{pinDescription}</small>
            </Modal.Body>
            <Modal.Footer>

                <Button variant="primary" onClick={handleCreateFeed}>
                    Create Feed
                </Button>

            </Modal.Footer>
        </Modal >
    )

}

