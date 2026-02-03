'use client';

import React, { useState, useEffect } from 'react';
import Boards from './Boards';
import Feeds from './Feeds';
import FeedModal from '../ui/FeedModal';
import { FiPlus } from 'react-icons/fi';

import { updateValuesToDatabase } from '../../miscFunctions/actions';
import './LandingPage.css'

const LandingPage = (props) => {
  const [userUid, setUserUid] = useState(null);
  const [dbData, setDBData] = useState({});
  const [selectedDeviceCode, setSelectedDeviceCode] = useState('');
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedType, setFeedType] = useState('Card');
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [mcuType, setMcuType] = useState('ESP32');
  const [GPIO, setGPIO] = useState(0);
  const [rPIN, setRPIN] = useState(0);
  const [gPIN, setGPIN] = useState(0);
  const [bPIN, setBPIN] = useState(0);


  const boardSelection = (devCode, devFeed) => {
    const feedStatus = dbData[devCode].devFeeds[devFeed].isSelected;
    updateValuesToDatabase(`${userUid}/${devCode}/devFeeds/${devFeed}`, { "isSelected": !feedStatus });
  }

  useEffect(() => {

    if (props.userData) {
      setUserUid(props.userData.uid);
      setDBData(props.userDbData);
    } else {
      setUserUid(null);
      setDBData(null);
    }
  }, [props.userData, props.userDbData]);

  useEffect(() => {
    const deviceList = Object.entries(props.userDbData)
      // .filter(([key]) => key !== 'display')
      .map(([deviceCode, device]) => ({
        deviceCode: deviceCode,
        deviceName: device.deviceName
      }));
    setDevices(deviceList);
    if (deviceList.length > 0 && !selectedDeviceCode) {
      setSelectedDeviceCode(deviceList[0].deviceCode);
    }
  }, [dbData]);

  const handleCreateFeed = () => {

    if (!feedName) {
      alert("Feed name is required.");
      return;
    }
    const reference = `${props.userData.uid}/${selectedDeviceCode}/devFeeds/${feedName}`;
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
      newFeed.mcu = mcuType;
    }

    if (feedType === 'Colour') {
      newFeed.rPIN = parseInt(rPIN);
      newFeed.gPIN = parseInt(gPIN);
      newFeed.bPIN = parseInt(bPIN);
      newFeed.mcu = mcuType;
      newFeed.value = "#2576b9";
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


  return (
    <div className='container-fluid bg-dark text-light flex-grow-1 overflow-auto pb-5 d-flex flex-column'>
      <div className='container d-flex justify-content-between align-items-center pt-2'>
        <div className='d-flex justify-content-start gap-3 align-items-center flex-wrap'>
          {
            Object.keys(dbData).map(data => {
              if (data == "display") return;
              return (
                <Boards
                  key={data}
                  boardKey={data}
                  sendSelectedBoard={boardSelection}
                  boardData={dbData[data]}
                  uid={userUid}
                />
              )
            })
          }
        </div>
      </div>
      <div className='h-100 container justify-content-start pt-2'>
        {dbData && <Feeds feedData={dbData} userUid={userUid} />}
      </div>

      <button
        className="plus-button"
        onClick={() => setShowModal(true)}
        title="Add new feed"
      >
        <FiPlus size={24} />
      </button>

      <FeedModal
        purpose={"create"}
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
        setSelectedDeviceCode={setSelectedDeviceCode}
        mcuType={mcuType}
        setMcuType={setMcuType}
        rPIN={rPIN}
        gPIN={gPIN}
        bPIN={bPIN}
        setRPIN={setRPIN}
        setGPIN={setGPIN}
        setBPIN={setBPIN}
      />
    </div>

  );
};

export default LandingPage;
