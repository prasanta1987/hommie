'use client';

import React, { useState, useEffect, useRef } from 'react';
import Boards from './Boards';
import Feeds from './Feeds';
import { FiPlus } from 'react-icons/fi';
import FeedCreateModal from '@/app/feeds/ui/FeedCreateModal';
import { updateValuesToDatabase } from '@/app/miscFunctions/actions';
import './LandingPage.css'

const LandingPage = ({ userDbData, userData }) => {
  const [selectedDeviceCode, setSelectedDeviceCode] = useState('');
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // console.log(boardList);

  const userUid = userData.uid;

  useEffect(() => {
    const deviceList = Object.entries(userDbData)
      // .filter(([key]) => key !== 'display')
      .map(([key, data]) => ({
        deviceCode: data.deviceCode,
        deviceName: data.deviceName,
        deviceType: data.deviceType || "ESP8266"
      }));
    setDevices(deviceList);

    if (deviceList.length > 0 && !selectedDeviceCode) {
      setSelectedDeviceCode(deviceList[0].deviceCode);
    }
  }, [userDbData]);

  const hasCleaned = useRef(false);
  useEffect(() => {
    if (hasCleaned.current || !userDbData || Object.keys(userDbData).length === 0) return;

    const updates = {};
    Object.keys(userDbData).forEach(deviceCode => {
      const board = userDbData[deviceCode];
      if (board.devFeeds) {
        Object.keys(board.devFeeds).forEach(feedName => {
          const feed = board.devFeeds[feedName];
          if (feed.type === 'HGraph') {
            // Identify and clear historical data points (objects with 'time' and 'value')
            Object.keys(feed).forEach(key => {
              if (typeof feed[key] === 'object' && feed[key] !== null && feed[key].time !== undefined) {
                updates[`${userUid}/${deviceCode}/devFeeds/${feedName}/${key}`] = null;
              }
            });
          }
        });
      }
    });

    if (Object.keys(updates).length > 0) {
      console.log("Cleaning HGraph data on load:", updates);
      updateValuesToDatabase('/', updates);
    }
    hasCleaned.current = true;
  }, [userDbData, userUid]);


  return (
    <div className='container-fluid bg-dark text-light flex-grow-1 overflow-auto pb-5 d-flex flex-column'>
      <div className='container d-flex justify-content-between align-items-center pt-2'>
        <div className='d-flex justify-content-start gap-3 align-items-center flex-wrap'>
          {
            Object.keys(userDbData).map(data => {
              if (data == "display") return;
              return (
                <Boards
                  key={data}
                  boardKey={data}
                  boardData={userDbData[data]}
                  uid={userUid}
                />
              )
            })
          }
        </div>
      </div>
      <div className='h-100 container justify-content-start pt-2'>
        {userDbData && <Feeds feedData={userDbData} userUid={userUid} />}
      </div>

      <button
        className="plus-button"
        onClick={() => setShowModal(true)}
        title="Add new feed"
      >
        <FiPlus size={24} />
      </button>

      <FeedCreateModal
        isOpen={showModal}
        setShowModal={() => setShowModal(false)}
        devices={devices}
        uid={userUid}
        selectedDeviceCode={selectedDeviceCode}
        setSelectedDeviceCode={setSelectedDeviceCode}
      />

    </div>

  );
};

export default LandingPage;
