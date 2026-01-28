import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiSettings } from 'react-icons/fi';
import FeedSettingsModal from './FeedSettingsModal';
import { calculateAgeing } from '../../miscFunctions/timeCalculation';
import Gauge from "@nationsinfo/react-simple-gauge";
import './FeedCard.css';
import { updateValuesToDatabase } from '../../miscFunctions/actions';

export default function FeedCard({ feed, boardName, feedName, deviceCode, uid, type }) {

    const [showModal, setShowModal] = useState(false);
    const [longAging, setLongAging] = useState(false);
    const [millis, setMillis] = useState(0);
    const [sliderValue, setSliderValue] = useState(feed.value);

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
        updateValuesToDatabase(`${uid}/${deviceCode}/devFeeds/${feedName}`, { value: e.target.value });
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
                        <Gauge
                            key={`${deviceCode}-${feedName}`}
                            value={feed.value}
                            min={feed.rangeMin}
                            max={feed.rangeMax}
                            lowRangeColor="#4de774"
                            midRangeColor="#eeea17"
                            highRangeColor="#eb4848"
                            lowRangeBreakpoint={parseInt(feed.rangeMin * 0.35)}
                            midRangeBreakpoint={parseInt(feed.rangeMin * 0.75)}
                        />
                    ) : type === 'Slider' ? (
                        <div className='w-100'>
                            <div className="feed-value">{sliderValue}</div>
                            <div className="d-flex w-100 justify-content-between align-items-center">
                                <span>{feed.rangeMin}</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={sliderValue}
                                    className="feed-slider"
                                    onChange={(e) => setSliderValue(e.target.value)}
                                    onMouseUp={(e) => sliderValueChange(e)}
                                    onTouchEnd={(e) => sliderValueChange(e)}
                                />
                                <span>{feed.rangeMax}</span>
                            </div>
                        </div>
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
            />
        </>
    );
};
