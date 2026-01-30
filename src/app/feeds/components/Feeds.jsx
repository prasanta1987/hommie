import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiPlus } from 'react-icons/fi';
import { Modal, Button, Form } from 'react-bootstrap';
import NoFeed from '../ui/NoFeed'
import FeedCard from '../ui/FeedCard'
import CreateFeedModal from '../ui/CreateFeedModal';
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
    const [GPIO, setGPIO] = useState(0);

    useEffect(() => {
        // console.log(props.feedData);

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
            deviceName: selectedDevice?.deviceName,
            GPIO: GPIO
        });

        const reference = `${props.userUid}/${selectedDeviceCode}/devFeeds/${feedName}`;
        const newFeed = {
            type: feedType,
            value: 0,
            time: new Date().getTime(),
            isSelected: true
        };

        if (feedType === 'Gauge' || feedType === 'Slider') {
            newFeed.rangeMin = parseFloat(minValue);
            newFeed.rangeMax = parseFloat(maxValue);
        }

        if (feedType === 'Toggle') {
            newFeed.GPIO = parseInt(GPIO);
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

            <CreateFeedModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                feedName={feedName}
                setFeedName={setFeedName}
                selectedDeviceCode={selectedDeviceCode}
                devices={devices}
                feedType={feedType}
                setFeedType={setFeedType}
                minValue={minValue}
                setMinValue={setMinValue}
                maxValue={maxValue}
                setMaxValue={setMaxValue}
                handleCreateFeed={handleCreateFeed}
                setGPIO={setGPIO}
            />

        </div>
    );
});
Feeds.displayName = "Feeds";

export default Feeds;
