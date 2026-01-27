import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './FeedSettingsModal.css';

export default function FeedSettingsModal({ isOpen, onClose, feed, boardName, feedName }) {

    if (!isOpen) return null;

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{feedName} Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Board: {boardName}</p>
                <p>Current Value: {feed.value}</p>
                {/* Add your settings form here */}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary">
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}