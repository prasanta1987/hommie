import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
// import './FeedSettingsModal.css';
import { updateValuesToDatabase, setValueToDatabase } from '../../miscFunctions/actions';

export default function CreateFeedModal({
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
    handleCreateFeed
}) {

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onHide={onClose} centered data-bs-theme="dark">
            <Modal.Header closeButton>
                <Modal.Title>Create New Feed</Modal.Title>
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
                            placeholder="Enter feed name"
                            value={feedName}
                            onChange={(e) => setFeedName(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Feed Type</Form.Label>
                        <div className="d-flex flex-row justify-content-between">
                            <Form.Check
                                type="radio"
                                id="card-type"
                                label="Card"
                                value="Card"
                                checked={feedType === 'Card'}
                                onChange={(e) => setFeedType(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                id="gauge-type"
                                label="Gauge"
                                value="Gauge"
                                checked={feedType === 'Gauge'}
                                onChange={(e) => setFeedType(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                id="slider-type"
                                label="Slider"
                                value="Slider"
                                checked={feedType === 'Slider'}
                                onChange={(e) => setFeedType(e.target.value)}
                            />
                            <Form.Check
                                type="checkbox"
                                id="toggle-checkbox"
                                label="Toggle"
                                value="Toggle"
                                checked={feedType === 'Toggle'}
                                onChange={(e) => setFeedType(e.target.value)}
                            />
                        </div>
                    </Form.Group>

                    {(feedType === 'Gauge' || feedType === 'Slider') && (
                        <>
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
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleCreateFeed}>
                    Create Feed
                </Button>
            </Modal.Footer>
        </Modal>
    )

}

