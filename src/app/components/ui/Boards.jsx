import { useEffect, useState } from 'react';
import { Badge, Modal, Button, Form } from 'react-bootstrap';
import { FiHardDrive, FiChevronDown, FiChevronUp, FiEdit } from 'react-icons/fi';

import './Boards.css';

import { setValueToDatabase, updateValuesToDatabase } from '../../miscFunctions/actions';

export default function Boards(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [boardName, setBoardName] = useState(props.boardData.deviceName);
    const [deviceCode, setDeviceCode] = useState(props.boardData.deviceCode);

    useEffect(() => {
        console.log(props.boardData)
        setBoardName(props.boardData.deviceName);
        setDeviceCode(props.boardKey);
    }, [props.boardData.name, props.boardData.deviceCode]);


    const onFeedSelect = (devCode, devFeed) => {
        props.sendSelectedBoard(devCode, devFeed);
        setIsOpen(false); // Close dropdown after selection
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleShowModal = () => {
        setBoardName(boardName); // Reset input field to current name
        setShowModal(true);
        setIsOpen(false); // Close dropdown when opening modal
    };
    const handleCloseModal = () => setShowModal(false);

    const handleSaveName = () => {
        setBoardName(boardName);

        updateValuesToDatabase(`${props.uid}/${deviceCode}`, {
            "deviceName": boardName,
            "deviceCode": deviceCode
        })
        handleCloseModal();
    };



    const deleteBoard = () => {
        updateValuesToDatabase(`${props.uid}/${deviceCode}`, {
            "isDeleted": props.boardData.isDeleted ? false : true
        })
        setShowModal(false);
    };

    const forceDeleteBoard = () => {
        setValueToDatabase(`${props.uid}/${deviceCode}`, null)
        setShowModal(false);
    }


    return (
        // (props.boardData.hasOwnProperty("name") && props.boardData.hasOwnProperty("deviceCode"))
        (typeof props.boardData == 'object')
        &&
        <>
            <div className={"boards-dropdown"}>
                <button onClick={toggleDropdown} className={`boards-dropdown-toggle ${props.boardData.isDeleted && "bg-warning"}`}>
                    <FiHardDrive className="boards-dropdown-item-icon" />
                    <span>{boardName || props.boardKey}</span>
                    {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {isOpen && (
                    <div className="boards-dropdown-menu">
                        <div className="boards-dropdown-header">
                            {boardName || props.boardKey}
                            <FiEdit onClick={handleShowModal} style={{ cursor: 'pointer', marginLeft: '10px' }} />
                        </div>
                        {(props.boardData.devFeeds) &&
                            Object.keys(props.boardData.devFeeds).map(devFeed => {
                                const isSelected = props.boardData.devFeeds[devFeed].isSelected;
                                return (
                                    <div
                                        className={`boards-dropdown-item ${isSelected ? "bg-primary text-light" : ""}`}
                                        key={devFeed}
                                        onClick={() => onFeedSelect(deviceCode, devFeed)}
                                    >
                                        <span>{devFeed}</span>
                                        <Badge className='bg-dark'>{props.boardData.devFeeds[devFeed].value}</Badge>
                                    </div>
                                )
                            })
                        }
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Board Name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBoardName">
                            <Form.Label>Board Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={boardName}
                                onChange={(e) => setBoardName(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-between'>
                    <div className='d-flex justify-content-between gap-1'>
                        <Button variant={`${props.boardData.isDeleted ? "success" : "warning"}`}
                            onClick={deleteBoard}>
                            {props.boardData.isDeleted ? "Restore" : "Delete"}
                        </Button>
                        {
                            props.boardData.isDeleted &&
                            <Button variant="danger" onClick={forceDeleteBoard}>
                                Force Delete
                            </Button>
                        }
                    </div>
                    <Button variant="primary" onClick={handleSaveName}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
