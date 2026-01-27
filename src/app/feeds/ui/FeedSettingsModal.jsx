import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './FeedSettingsModal.css';
import { updateValuesToDatabase } from '../../miscFunctions/actions';

export default function FeedSettingsModal({ isOpen, onClose, feed, boardName, feedName, deviceCode, uid }) {
    const [feedType, setFeedType] = useState(feed.type || 'Card');

    if (!isOpen) return null;

    const handleSave = () => {
        const reference = `${uid}/${deviceCode}/devFeeds/${feedName}`;
        const updatedFeed = { type: feedType };
        updateValuesToDatabase(reference, updatedFeed);
        onClose();
    }


    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{feedName} Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Board: {boardName}</p>
                <p>Current Value: {feed.value}</p>
                <Form>
                    <Form.Group>
                        <Form.Label>Display Type</Form.Label>
                        <div className="mb-3">
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
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}