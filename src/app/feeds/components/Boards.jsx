import { useEffect, useState } from 'react';
import { Badge, Modal, Button, Form } from 'react-bootstrap';
import { FiHardDrive, FiChevronDown, FiChevronUp, FiEdit, FiSettings } from 'react-icons/fi';
import { BiSolidBoltCircle } from "react-icons/bi"
import { mcuTypes } from '@/app/miscFunctions/espSafeGPIOs';

import './Boards.css';

import { setValueToDatabase, updateValuesToDatabase } from '../../miscFunctions/actions';

export default function Boards({ boardData, uid, sendSelectedBoard }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [boardName, setBoardName] = useState(boardData.deviceName || '');
    const [deviceType, setDeviceType] = useState(boardData.deviceType || null);

    const deviceCode = boardData.deviceCode;


    const onFeedSelect = (devCode, devFeed) => {
        sendSelectedBoard(devCode, devFeed);
        setIsOpen(false); // Close dropdown after selection
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleShowModal = () => {
        // setBoardName(boardName); // Reset input field to current name
        setShowModal(true);
        setIsOpen(false); // Close dropdown when opening modal
    };
    const handleCloseModal = () => {

        if (!deviceType) {
            alert("Please Select Device Type")
            return
        }

        setShowModal(false)
    };

    const handleSaveName = () => {

        if (!deviceType || deviceType == "Select MCU") {
            alert("Please Select Device Type")
            return
        }

        setBoardName(boardName);

        const data = {
            deviceName: boardName,
            deviceCode: deviceCode,
            deviceType: deviceType
        }

        updateValuesToDatabase(`${uid}/${deviceCode}`, data);
        handleCloseModal();
    };



    const deleteBoard = () => {
        if (!confirm("Are Sure Want to Delete?")) return;

        setValueToDatabase(`${uid}/${deviceCode}`, null)
        setShowModal(false);
    };

    useEffect(() => {
        if (!boardData.deviceType) setShowModal(true);
        setDeviceType(boardData.deviceType);
    }, [boardData])

    return (
        // (props.boardData.hasOwnProperty("name") && props.boardData.hasOwnProperty("deviceCode"))
        (typeof boardData == 'object')
        &&
        <>
            <div className={"boards-dropdown"}>
                <button
                    onClick={toggleDropdown}
                    className={`boards-dropdown-toggle ${(!boardData.deviceType) && "bg-warning"}`}
                    style={{ backgroundColor: isOpen && '#153b68' }}
                >
                    <BiSolidBoltCircle size={20} color="#ebf1eb" className="boards-dropdown-item-icon" />
                    <span className='m-2'>{boardName || deviceCode}</span>
                    {/* {isOpen ? <FiChevronUp /> : <FiChevronDown />} */}
                </button>
                <div className='board-settings' onClick={handleShowModal}>
                    <FiSettings style={{ cursor: 'pointer', color: '#00fff2' }} />
                </div>
                {isOpen && (
                    <div className="boards-dropdown-menu">
                        {/* <div className="boards-dropdown-header">
                            {boardName || deviceCode}
                            <FiEdit onClick={handleShowModal} style={{ cursor: 'pointer', marginLeft: '10px' }} />
                        </div> */}
                        {(boardData.devFeeds) &&
                            Object.keys(boardData.devFeeds).map(devFeed => {
                                const isSelected = boardData.devFeeds[devFeed].isSelected;
                                return (
                                    <div
                                        className={`boards-dropdown-item ${isSelected ? "bg-primary text-light" : ""}`}
                                        key={devFeed}
                                        onClick={() => onFeedSelect(deviceCode, devFeed)}
                                    >
                                        <span>{devFeed}</span>
                                        <Badge className='bg-dark'>{boardData.devFeeds[devFeed].value}</Badge>
                                    </div>
                                )
                            })
                        }
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={handleCloseModal} centered data-bs-theme="dark">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Board Name ~ {deviceCode}</Modal.Title>
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

                        <Form.Group className="w-100 mb-3">
                            <Form.Label className={(deviceType == "Select MCU" || !boardData.deviceType) && 'text-danger fw-bold'}>Select Microcontroller</Form.Label>
                            <Form.Select
                                value={deviceType || boardData.deviceType}
                                className={!deviceType && 'border-danger'}
                                onChange={(e) => setDeviceType(e.target.value)}
                                required={true}
                            >
                                <option>Select MCU</option>
                                {Object.keys(mcuTypes).map((key) => (
                                    <option key={key} value={key}>
                                        {mcuTypes[key].name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                    </Form>
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-between'>
                    <div className='d-flex justify-content-between gap-1'>
                        <Button variant="danger"
                            onClick={deleteBoard}>
                            Delete
                        </Button>
                    </div>
                    <Button variant="primary" onClick={handleSaveName}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
