import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiSettings } from 'react-icons/fi';
import { calculateAgeing } from '../../miscFunctions/timeCalculation';
// import Gauge from "@nationsinfo/react-simple-gauge";
import './FeedCard.css';
import { setValueToDatabase, updateValuesToDatabase } from '../../miscFunctions/actions';
import FeedModal from './FeedModal';

import GaugeUI from '../ui/GaugeUI';
import SliderUI from '../ui/SliderUI';
import ToggleUI from '../ui/ToggleUI';
import ColourPickerUI from '../ui/ColourPickerUI';


export default function FeedCard({ feed, boardName, feedName, deviceCode, uid, type }) {

    const [showModal, setShowModal] = useState(false);
    const [longAging, setLongAging] = useState(false);
    const [millis, setMillis] = useState(0);
    const [sliderValue, setSliderValue] = useState(feed.value);
    const [GPIO, setGPIO] = useState(feed.GPIO || 0);
    const [feedType, setFeedType] = useState(feed.type || 'Card');
    const [minValue, setMinValue] = useState(feed.rangeMin || 0);
    const [maxValue, setMaxValue] = useState(feed.rangeMax || 100);
    const [mcuType, setMcuType] = useState(feed.mcu || 'ESP32');
    const [rPIN, setRPIN] = useState(0);
    const [gPIN, setGPIN] = useState(0);
    const [bPIN, setBPIN] = useState(0);

    const dbTimestamp = feed.time ? feed.time : null;


    useEffect(() => {
        setMcuType(feed.mcu || 'ESP32');
        setSliderValue(feed.value);
        setGPIO(feed.GPIO || 0);
        setRPIN(feed.rPIN || 0);
        setGPIN(feed.gPIN || 0);
        setBPIN(feed.bPIN || 0);
        setFeedType(feed.type || 'Card');
        setMinValue(feed.rangeMin || 0);
        setMaxValue(feed.rangeMax || 100);
    }, [feed.value, feed.type, feed.rangeMin, feed.rangeMax]);

    useEffect(() => {
        if (longAging) return;

        const interval = setInterval(() => {
            setMillis(new Date().getTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [longAging]);

    useEffect(() => {
        if (dbTimestamp) {
            const diffMs = new Date().getTime() - dbTimestamp;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHrs >= 24) {
                setLongAging(true);
            }
        }
    }, [dbTimestamp]);

    if (!feed) return null;

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
            updatedFeed.GPIO = parseInt(GPIO) || 2;
            updatedFeed.mcu = mcuType;
        }

        if (feedType === 'Colour') {
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


    const sliderValueChange = (e) => {
        // console.log(e.target.value);
        updateValuesToDatabase(`${uid}/${deviceCode}/devFeeds/${feedName}`,
            {
                value: e.target.value,
                time: new Date().getTime()
            });
    }

    return (
        <>
            <div className="feed-card">
                <div className="feed-card-header">
                    <FiZap className="feed-icon" />
                    <span className="feed-name">{feedName}</span>
                    <FiSettings
                        className="settings-icon"
                        onClick={() => setShowModal(true)}
                    />
                </div>
                <div className="feed-card-body">
                    {type === 'Gauge' ? (
                        <GaugeUI
                            value={feed.value}
                            minValue={feed.rangeMin}
                            maxValue={feed.rangeMax}
                        />
                    ) : type === 'Slider' ? (
                        <SliderUI
                            value={sliderValue}
                            rangeMin={feed.rangeMin}
                            rangeMax={feed.rangeMax}
                            onChange={(value) => setSliderValue(value)}
                            onMouseUp={(value) => sliderValueChange({ target: { value } })}
                            onTouchEnd={(value) => sliderValueChange({ target: { value } })}
                        />

                    ) : type === 'Toggle' ? (
                        <ToggleUI
                            value={sliderValue}
                            onChange={(checked) => {
                                setSliderValue(checked)
                                sliderValueChange({ target: { value: checked ? 1 : 0 } })
                            }}
                        />
                    ) : type === 'Colour' ? (
                        <ColourPickerUI
                            value={sliderValue}
                            rPIN={rPIN}
                            gPIN={gPIN}
                            bPIN={bPIN}
                            onBlur={(value) => {
                                setSliderValue(value)
                                sliderValueChange({ target: { value } })
                            }}
                        />
                    ) : (
                        <div className="feed-value">{feed.value}</div>
                    )}
                </div>
                <div className="feed-card-footer">
                    <div className="feed-board-info">
                        <FiCpu className="board-icon" />
                        <span>{boardName}</span>
                    </div>
                    <div className="feed-timestamp d-flex align-items-center">
                        <FiClock className="board-icon" />
                        <span>
                            {dbTimestamp ? calculateAgeing(dbTimestamp) : 'No timestamp'}
                        </span>
                    </div>
                </div>
            </div>
            <FeedModal
                purpose={"settings"}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                feed={feed}
                boardName={boardName}
                feedName={feedName}
                deviceCode={deviceCode}
                uid={uid}
                setGPIO={setGPIO}
                setBPIN={setBPIN}
                setGPIN={setGPIN}
                setRPIN={setRPIN}
                rPIN={rPIN}
                gPIN={gPIN}
                bPIN={bPIN}
                GPIO={GPIO}
                handleDeleteFeed={handleDeleteFeed}
                handleCreateFeed={handleCreateFeed}
                feedType={feedType}
                setFeedType={setFeedType}
                minValue={minValue}
                setMinValue={setMinValue}
                maxValue={maxValue}
                setMaxValue={setMaxValue}
                mcuType={mcuType}
                setMcuType={setMcuType}
            />
        </>
    );
};
