'use client';

import React, { useState, useEffect } from 'react';
import Boards from './ui/Boards';
import Feeds from './ui/Feeds';
import { Container } from 'react-bootstrap';

import { updateValuesToDatabase } from '../miscFunctions/actions';
import './LandingPage.css'

const LandingPage = (props) => {


  const [userUid, setUserUid] = useState(null);
  const [dbData, setDBData] = useState({});

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


  return (
    <Container fluid className='bg-dark text-light flex-grow-1 overflow-auto pb-5'>
      <Container className='d-flex justify-content-between align-items-center pt-2'>
        <div className='d-flex justify-content-start gap-3 align-items-center flex-wrap'>
          {
            Object.keys(dbData).map(data => {
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
      </Container>
      <Container className='justify-content-start pt-2'>
        {dbData && <Feeds feedData={dbData} />}
      </Container>
    </Container>

  );
};

export default LandingPage;
