'use client';

import React, { useState, useEffect } from 'react';
import { FiHardDrive, FiChevronDown, FiChevronUp, FiEdit } from 'react-icons/fi';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import '../components/LandingPage.css';
import { updateBoardName } from '../actions';

const Boards = ({ uid, boardData, isOpen, onToggle }) => {
    const [showModal, setShowModal] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [state, setState] = useState({ message: "", errors: {} });

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => {
      setShowModal(false);
    };

    const onFeedSelect = (feedName) => { 
        console.log(`Selected feed: ${feedName} on board: ${boardData.deviceCode}`);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.target);
        const result = await updateBoardName(uid, formData);
        setState(result);
        setIsPending(false);
    };

    useEffect(() => {
        if (state.message === "success") {
            handleCloseModal();
        }
    }, [state]);

    return (
        <div className="board-container bg-light rounded p-2 shadow-sm position-relative">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <FiHardDrive className="me-2" />
                    <h6 className="mb-0 me-2">{boardData.name}</h6>
                    <Button variant="link" onClick={handleShowModal} className="p-0">
                        <FiEdit size="0.8rem"/>
                    </Button>
                </div>
                <div className="d-flex align-items-center">
                    <Button variant="light" size="sm" onClick={onToggle}>
                        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div className="dropdown-overlay shadow-lg rounded">
                    <h6 className='pt-2 px-2'>Feeds:</h6>
                    {boardData.devFeeds ? (
                        <ul className="list-group list-group-flush">
                            {Object.entries(boardData.devFeeds).map(([feedName, feedData]) => (
                                <li key={feedName} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{feedName}:</strong> {String(feedData.value)}
                                        <br />
                                        <small className="text-muted">{new Date(feedData.time).toLocaleString()}</small>
                                    </div>
                                    <Form.Check 
                                        type="switch"
                                        id={`feed-switch-${boardData.deviceCode}-${feedName}`}
                                        checked={feedData.isSelected}
                                        onChange={() => onFeedSelect(feedName)}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className='px-2'>No feeds available for this board.</p>
                    )}
                </div>
            )}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Board Name</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <input type="hidden" name="deviceCode" value={boardData.deviceCode} />
                        <Form.Group className="mb-3">
                            <Form.Label>Board Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="newName" 
                                defaultValue={boardData.name} 
                                isInvalid={!!state.errors?.newName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {state.errors?.newName?.join(', ')}
                            </Form.Control.Feedback>
                        </Form.Group>
                         {state.message && state.message !== "success" && (
                            <div className="alert alert-danger">{state.message}</div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={isPending}>Close</Button>
                        <Button variant="primary" type="submit" disabled={isPending}>
                            {isPending ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Saving...</> : "Save Changes"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Boards;
