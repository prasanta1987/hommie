import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FeedTypes from './FeedTypes';
import { mcuTypes } from '@/app/miscFunctions/espSafeGPIOs';

export default function FeedModal({
    purpose,
    isOpen,
    onClose,
    feedName,
    setFeedName,
    selectedDeviceCode,
    setSelectedDeviceCode,
    devices,
    feedType,
    setFeedType,
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    handleCreateFeed,
    uid, deviceCode,
    GPIO,
    setGPIO,
    handleDeleteFeed,
    rPIN,
    setRPIN,
    gPIN,
    setGPIN,
    bPIN,
    setBPIN,
    mcuType,
    setMcuType,
    setIsSwapped,
    isSwapped

}) {



    const [pinDescription, setPinDescription] = useState('');
    const currentSafePins = mcuTypes[mcuType || "ESP8266"].safeGPIOs;

    if (!isOpen && !purpose) return null;

    return (
        <Modal show={isOpen} onHide={onClose} centered data-bs-theme="dark" size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>
                    {purpose === "create" ? "Create New Feed" : `${feedName} Settings`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {
                        purpose === "create" && (
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
                        )
                    }


                    {
                        purpose === "create" && (
                            <Form.Group className="mb-3">
                                <Form.Label>Feed Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    placeholder="Enter feed name"
                                    value={feedName}
                                    disabled={purpose === "settings"}
                                    onChange={(e) => setFeedName(e.target.value)}
                                />
                            </Form.Group>
                        )
                    }

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

                            {/* Dynamic GPIO Dropdown (mapping objects) */}
                            <Form.Group className="w-20 mb-3">
                                <Form.Check
                                    type="checkbox"
                                    label="Swap"
                                    checked={isSwapped} // Use your state here
                                    onChange={(e) => setIsSwapped(e.target.checked)}
                                // label="Enable Swapping" // Optional: You can put the label here instead of Form.Label
                                />
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

                {
                    purpose === "settings" && (
                        <Button variant="danger" onClick={() => handleDeleteFeed(feedName, uid, deviceCode)}>
                            Delete Feed
                        </Button>
                    )
                }
                <Button variant="primary" onClick={handleCreateFeed}>
                    {purpose === "create" ? "Create Feed" : "Update Feed"}
                </Button>
            </Modal.Footer>
        </Modal >
    )

}

