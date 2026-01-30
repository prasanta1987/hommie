import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiSettings } from 'react-icons/fi';
import FeedSettingsModal from './FeedSettingsModal';
import { calculateAgeing } from '../../miscFunctions/timeCalculation';
// import Gauge from "@nationsinfo/react-simple-gauge";
import './FeedCard.css';
import { updateValuesToDatabase } from '../../miscFunctions/actions';
import GaugeUI from '../ui/GaugeUI';
import SliderUI from '../ui/SliderUI';
import ToggleUI from '../ui/ToggleUI';

export default function FeedCard({ feed, boardName, feedName, deviceCode, uid, type }) {

    const [showModal, setShowModal] = useState(false);
    const [longAging, setLongAging] = useState(false);
    const [millis, setMillis] = useState(0);
    const [sliderValue, setSliderValue] = useState(feed.value);
    const [GPIO, setGPIO] = useState(feed.GPIO || 0);

    const dbTimestamp = feed.time ? feed.time : null;


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

    const sliderValueChange = (e) => {
        console.log(e.target.value);
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
                                sliderValueChange({ target: { value: checked?1:0 } })
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
            <FeedSettingsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                feed={feed}
                boardName={boardName}
                feedName={feedName}
                deviceCode={deviceCode}
                uid={uid}
                setGPIO={setGPIO}
                GPIO={GPIO}
            />
        </>
    );
};
