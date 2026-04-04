'use client';

import React, { useState, useEffect } from 'react';
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


  const userUid = userData.uid;

  const boardSelection = (devCode, devFeed) => {
    const feedStatus = userDbData[devCode].devFeeds[devFeed].isSelected;
    updateValuesToDatabase(`${userUid}/${devCode}/devFeeds/${devFeed}`, { "isSelected": !feedStatus });
  }

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
                  sendSelectedBoard={boardSelection}
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
