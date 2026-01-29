import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiPlus } from 'react-icons/fi';
import { Modal, Button, Form } from 'react-bootstrap';
import NoFeed from '../ui/NoFeed'
import FeedCard from '../ui/FeedCard'
import './LandingPage.css'
import { updateValuesToDatabase } from '../../miscFunctions/actions';

const Feeds = React.memo((props) => {
    const [selectedFeeds, setSelectedFeeds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [feedName, setFeedName] = useState('');
    const [feedType, setFeedType] = useState('Card');
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(100);
    const [selectedDeviceCode, setSelectedDeviceCode] = useState('');
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        console.log(props.feedData);

        if (props.feedData) {
            const userDbData = Object.values(props.feedData);
            const feeds = userDbData.flatMap(board => {
                if (board.devFeeds) {
                    return Object.keys(board.devFeeds)
                        .filter(feedName => board.devFeeds[feedName].isSelected)
                        .map(feedName => ({
                            ...board.devFeeds[feedName],
                            boardName: board.deviceName,
                            feedName: feedName,
                            id: `${board.deviceCode}-${feedName}`,
                            deviceCode: board.deviceCode
                        }));
                }
                return [];
            });
            setSelectedFeeds(feeds);

            // Extract devices for the dropdown
            const deviceList = Object.entries(props.feedData)
                // .filter(([key]) => key !== 'display')
                .map(([deviceCode, device]) => ({
                    deviceCode: deviceCode,
                    deviceName: device.deviceName
                }));
            setDevices(deviceList);
            if (deviceList.length > 0 && !selectedDeviceCode) {
                setSelectedDeviceCode(deviceList[0].deviceCode);
            }
        } else {
            setSelectedFeeds([]);
            setDevices([]);
        }
    }, [props.feedData, selectedDeviceCode]);

    const handleCreateFeed = () => {
        const selectedDevice = devices.find(d => d.deviceCode === selectedDeviceCode);
        console.log({
            feedName: feedName,
            feedType: feedType,
            minValue: parseFloat(minValue),
            maxValue: parseFloat(maxValue),
            deviceCode: selectedDeviceCode,
            deviceName: selectedDevice?.deviceName
        });

        const reference = `${props.userUid}/${selectedDeviceCode}/devFeeds/${feedName}`;
        const newFeed = {
            type: feedType,
            isSelected: true
        };

        if (feedType === 'Gauge' || feedType === 'Slider') {
            newFeed.rangeMin = parseFloat(minValue);
            newFeed.rangeMax = parseFloat(maxValue);
        }

        updateValuesToDatabase(reference, newFeed);

        // Reset form fields
        setSelectedDeviceCode(devices.length > 0 ? devices[0].deviceCode : '');

        setFeedName('');
        setFeedType('Card');
        setMinValue(0);
        setMaxValue(100);
        setShowModal(false);
    }

    if (selectedFeeds.length === 0) {
        return <NoFeed />;
    }

    return (
        <div className="feeds-grid">
            {selectedFeeds.map(feed => {
                return <FeedCard
                    key={feed.id}
                    type={feed.type}
                    feed={feed}
                    boardName={feed.boardName}
                    feedName={feed.feedName}
                    deviceCode={feed.deviceCode}
                    uid={props.userUid}
                />

            })}
            <button
                className="plus-button"
                onClick={() => setShowModal(true)}
                title="Add new feed"
            >
                <FiPlus size={24} />
            </button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
                                    type="radio"
                                    id="toggle-type"
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
        </div>
    );
});
Feeds.displayName = "Feeds";

export default Feeds;
