import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
// import './FeedSettingsModal.css';
import { updateValuesToDatabase, setValueToDatabase } from '../../miscFunctions/actions';

export default function FeedSettingsModal({ isOpen, onClose, feed, boardName, feedName, deviceCode, uid }) {
    const [feedType, setFeedType] = useState(feed.type || 'Card');
    const [minValue, setMinValue] = useState(feed.min || 0);
    const [maxValue, setMaxValue] = useState(feed.max || 100);

    if (!isOpen) return null;

    const handleSave = () => {
        const reference = `${uid}/${deviceCode}/devFeeds/${feedName}`;
        const updatedFeed = { type: feedType };
        if (feedType === 'Gauge' || feedType === 'Slider') {
            updatedFeed.rangeMin = parseFloat(minValue);
            updatedFeed.rangeMax = parseFloat(maxValue);
        }
        updateValuesToDatabase(reference, updatedFeed);
        onClose();
    }

    const handleDeleteFeed = (feedName, uid, deviceCode) => {
        setValueToDatabase(`${uid}/${deviceCode}/devFeeds/${feedName}`, null);
        onClose();
    }


    return (
        <Modal show={isOpen} onHide={onClose} centered data-bs-theme="dark">
            <Modal.Header closeButton>
                <Modal.Title>Feed Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Feed Type</Form.Label>
                        <div className="mb-3 d-flex flex-row justify-content-between">
                            <Form.Check
                                type="radio"
                                id="card-radio"
                                label="Card"
                                value="Card"
                                checked={feedType === 'Card'}
                                onChange={(e) => setFeedType(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                id="gauge-radio"
                                label="Gauge"
                                value="Gauge"
                                checked={feedType === 'Gauge'}
                                onChange={(e) => setFeedType(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                id="slider-radio"
                                label="Slider"
                                value="Slider"
                                checked={feedType === 'Slider'}
                                onChange={(e) => setFeedType(e.target.value)}
                            />
                        </div>
                    </Form.Group>
                    {(feedType === 'Gauge' || feedType === 'Slider') && (
                        <div className='d-flex gap-2' style={{borderTop: '1px solid #063a3b', paddingTop: '5px'}}>
                            <Form.Group className="">
                                <Form.Label>Min Value</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={minValue}
                                    onChange={(e) => setMinValue(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="">
                                <Form.Label>Max Value</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={maxValue}
                                    onChange={(e) => setMaxValue(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer className='justify-content-between'>
                <Button variant="danger" onClick={() => handleDeleteFeed(feedName, uid, deviceCode)}>
                    Delete Feed
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}