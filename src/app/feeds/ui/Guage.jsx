import React, { useEffect, useState } from 'react';
import { FiZap, FiCpu, FiClock, FiSettings } from 'react-icons/fi';
import './FeedCard.css';
import FeedSettingsModal from './FeedSettingsModal';
import { calculateAgeing } from '../../miscFunctions/timeCalculation'
import Gauge from "@nationsinfo/react-simple-gauge";

import './Guage.css';


function GaugeUi({ value, min, max }) {
  return (
    <GaugeComponent
      value={84.94938709948751}
      type="grafana"
      minValue={0}
      maxValue={108}
      arc={{
        width: 0.55,
        cornerRadius: 0,
        nbSubArcs: 52,
        colorArray: ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"],
        padding: 0,
        subArcsStrokeWidth: 1,
        subArcsStrokeColor: "#000000",
        effects: { glow: true, glowBlur: 1, glowSpread: 2 }
      }}
      pointer={{
        type: "needle",
        elastic: false,
        animationDelay: 200,
        animationDuration: 1000,
        length: 0.87,
        width: 24,
        baseColor: "#ffffff",
        strokeWidth: 2,
        strokeColor: "#000000",
        maxFps: 60,
        animationThreshold: 0.0096
      }}
      labels={{
        valueLabel: {
          matchColorWithArc: true,
          style: { fontSize: "29px", fontWeight: "bold" },
          offsetY: 25,
          animateValue: true
        },
        tickLabels: {
          type: "outer",
          hideMinMax: false,
          autoSpaceTickLabels: true,
          ticks: [
            { value: 0 },
            { value: 4 },
            { value: 8 },
            { value: 15 },
            { value: 16 },
            { value: 23 },
            { value: 42 },
            { value: 108 }
          ]
        }
      }}
    />
  )
}

export default function Guage({ feed, boardName, feedName, deviceCode, uid }) {

  const [showModal, setShowModal] = useState(false);
  const [longAging, setLongAging] = useState(false);
  const [millis, setMillis] = useState(0);

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
        <div className="gauge-card-body">
          <Gauge
            className="gauge"
            value={feed.value}
            min={0}
            max={100}
            lowRangeColor="#18a7d3"
            midRangeColor="#eeea17"
            highRangeColor="#eb4848"
            lowRangeBreakpoint={30}
            midRangeBreakpoint={40}
          />
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
