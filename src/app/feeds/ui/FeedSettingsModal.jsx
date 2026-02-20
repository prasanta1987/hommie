import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import FeedTypes from './FeedTypes';
import { mcuTypes } from '@/app/miscFunctions/espSafeGPIOs';
import { setValueToDatabase, updateValuesToDatabase } from '@/app/miscFunctions/actions';

export default function FeedSettingsModal({
    isOpen, setShowModal, feed, uid
}) {


    const [feedType, setFeedType] = useState(feed.type || 'Card');
    const [minValue, setMinValue] = useState(feed.rangeMin || 0);
    const [maxValue, setMaxValue] = useState(feed.rangeMax || 100);
    const [isSwapped, setIsSwapped] = useState(feed.isSwapped || false);
    const [GPIO, setGPIO] = useState(feed.GPIO || 0);
    const [rPIN, setRPIN] = useState(feed.rPIN || 0);
    const [gPIN, setGPIN] = useState(feed.gPIN || 0);
    const [bPIN, setBPIN] = useState(feed.bPIN || 0);

    const [pinDescription, setPinDescription] = useState('');
    const currentSafePins = mcuTypes[feed.deviceType || "ESP8266"].safeGPIOs;
    const feedName = feed.feedName;
    const deviceCode = feed.deviceCode;

    const handleCreateFeed = () => {

        if (!feedName) {
            alert("Feed name is required.");
            return;
        }
        const reference = `${uid}/${deviceCode}/devFeeds/${feedName}`;
        const updatedFeed = { type: feedType };
        if (feedType === 'Gauge' || feedType === 'Slider') {
            updatedFeed.rangeMin = parseFloat(minValue);
            updatedFeed.rangeMax = parseFloat(maxValue);
        }

        if (feedType === 'Toggle') {

            if (isNaN(parseInt(GPIO))) {
                alert("GPIO must be a number.");
                return;
            }

            updatedFeed.GPIO = parseInt(GPIO);
            updatedFeed.isSwapped = isSwapped;

        }

        if (feedType === 'Colour') {
            if (isNaN(parseInt(rPIN)) || isNaN(parseInt(gPIN)) || isNaN(parseInt(bPIN))) {
                alert("PINs must be numbers.");
                return;
            }
            updatedFeed.rPIN = parseInt(rPIN);
            updatedFeed.gPIN = parseInt(gPIN);
            updatedFeed.bPIN = parseInt(bPIN);
        }

        updateValuesToDatabase(reference, updatedFeed);
        setShowModal(false);
    }

    const handleDeleteFeed = (feedName, uid, deviceCode) => {
        setValueToDatabase(`${uid}/${deviceCode}/devFeeds/${feedName}`, null);
        setShowModal(false);
    }

    return (
        <Modal show={isOpen} onHide={setShowModal} centered data-bs-theme="dark" size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>
                    Feed Settings
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
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
                            {/* Dynamic GPIO Dropdown (mapping objects) */}
                            <Form.Group className="w-100 mb-3">
                                <Form.Label>Select {mcuTypes[feed.deviceType || "ESP8266"].name} GPIO Pin</Form.Label>
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
                <Button variant="danger" onClick={() => handleDeleteFeed(feedName, uid, deviceCode)}>
                    Delete Feed
                </Button>


                <Button variant="primary" onClick={handleCreateFeed}>
                    Update Feed
                </Button>
            </Modal.Footer>
        </Modal >
    )

}

