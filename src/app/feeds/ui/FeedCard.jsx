import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiSettings } from 'react-icons/fi';
import { calculateAgeing } from '../../miscFunctions/timeCalculation';
import './FeedCard.css';
import { updateValuesToDatabase } from '../../miscFunctions/actions';

import GaugeUI from '../ui/GaugeUI';
import SliderUI from '../ui/SliderUI';
import ToggleUI from '../ui/ToggleUI';
import ColourPickerUI from '../ui/ColourPickerUI';
import FeedSettingsModal from '@/app/feeds/ui/FeedSettingsModal'


export default function FeedCard({ feed, boardName, feedName, deviceCode, uid, type }) {

    const [showModal, setShowModal] = useState(false);
    const [longAging, setLongAging] = useState(false);
    const [millis, setMillis] = useState(0);
    const [sliderValue, setSliderValue] = useState(feed.value);


    const dbTimestamp = feed.time ? feed.time : null;


    useEffect(() => {
        setSliderValue(feed.value);
    }, [feed]);

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




    const sliderValueChange = (type, value) => {

        if (type == "Toggle") {
            const multiUpdate = {};

            multiUpdate[`${uid}/${deviceCode}/devFeeds/${feedName}/value`] = value;
            multiUpdate[`${uid}/${deviceCode}/devFeeds/${feedName}/time`] = new Date().getTime();
            multiUpdate[`${uid}/${deviceCode}/display/${feedName}/value`] = value;

            updateValuesToDatabase(`/`, multiUpdate);

        } else {
            updateValuesToDatabase(`${uid}/${deviceCode}/devFeeds/${feedName}`,
                {
                    value: value,
                    time: new Date().getTime()
                });
        }

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
                            onMouseUp={(value) => sliderValueChange("Slider", value)}
                            onTouchEnd={(value) => sliderValueChange("Slider", value)}
                        />

                    ) : type === 'Toggle' ? (
                        <ToggleUI
                            value={sliderValue}
                            onChange={(checked) => {
                                setSliderValue(checked)
                                sliderValueChange("Toggle", checked ? 1 : 0)
                            }}
                        />
                    ) : type === 'Colour' ? (
                        <ColourPickerUI
                            value={sliderValue}
                            rPIN={feed.rPIN}
                            gPIN={feed.gPIN}
                            bPIN={feed.bPIN}
                            onBlur={(value) => {
                                setSliderValue(value)
                                sliderValueChange("Colour", value)
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

            <FeedSettingsModal isOpen={showModal} setShowModal={() => setShowModal(false)} feed={feed} uid={uid} />
        </>
    );
};
