import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FeedTypes from './FeedTypes';
import { mcuTypes } from '../../miscFunctions/espSafeGPIOs';

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
    setMcuType

}) {
    const currentSafePins = mcuTypes[mcuType || "ESP8266"].safeGPIOs;

    if (!isOpen) return null;

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

                            {/* Dynamic GPIO Dropdown (mapping objects) */}
                            <Form.Group className="w-100 mb-3">
                                <Form.Label>Select {mcuTypes[mcuType || "ESP8266"].name} GPIO Pin</Form.Label>
                                <Form.Select
                                    value={GPIO}
                                    onChange={(e) => setGPIO(e.target.value)}
                                >
                                    <option value="">-- Choose a Pin --</option>
                                    {currentSafePins.map((pin) => (
                                        <option key={pin.value} value={pin.value}>
                                            {pin.name} (Pin {pin.value})
                                        </option>
                                    ))}
                                </Form.Select>
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
                            <div className='d-flex gap-1 text-center'>
                                <div className='d-flex flex-column'>
                                    <Form.Label>Select Red PIN</Form.Label>
                                    <Form.Select
                                        value={rPIN}
                                        onChange={(e) => setRPIN(e.target.value)}
                                    >
                                        <option value="">-- Choose a Pin --</option>
                                        {currentSafePins.map((pin) => (
                                            <option key={pin.value} value={pin.value}>
                                                {pin.name} (Pin {pin.value})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <div className='d-flex flex-column'>
                                    <Form.Label>Select Green PIN</Form.Label>
                                    <Form.Select
                                        value={gPIN}
                                        onChange={(e) => setGPIN(e.target.value)}
                                    >
                                        <option value="">-- Choose a Pin --</option>
                                        {currentSafePins.map((pin) => (
                                            <option key={pin.value} value={pin.value}>
                                                {pin.name} (Pin {pin.value})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>

                                <div className='d-flex flex-column'>
                                    <Form.Label>Select Blue PIN</Form.Label>
                                    <Form.Select
                                        value={bPIN}
                                        onChange={(e) => setBPIN(e.target.value)}
                                    >
                                        <option value="">-- Choose a Pin --</option>
                                        {currentSafePins.map((pin) => (
                                            <option key={pin.value} value={pin.value}>
                                                {pin.name} (Pin {pin.value})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>

                            </div>
                        </>

                    )}
                </Form>
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

