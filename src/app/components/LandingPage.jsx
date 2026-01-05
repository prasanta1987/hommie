'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from "firebase/database";
import { Spinner } from 'react-bootstrap';
import './LandingPage.css'
import Boards from '../ui/Boards';

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const dbPath = user.uid;
      const dbRef = ref(db, dbPath);

      const unsubscribe = onValue(dbRef, (snapshot) => {
        setData(snapshot.val());
        setDataLoading(false);
      }, (error) => {
        setError(error);
        setDataLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleToggleDropdown = (deviceCode) => {
    setOpenDropdown(prev => (prev === deviceCode ? null : deviceCode));
  };

  if (userLoading) {
    return (
      <div className='container mb-5 text-dark'>
        <p>Loading user...</p>
      </div>
    );
  }

  let boardCollection = {};
  if (data) {
    if ('name' in data && 'deviceCode' in data) {
      boardCollection = { [data.deviceCode]: data };
    } else {
      boardCollection = data;
    }
  }

  return (
    <div className='container mb-5 text-dark'>
      {dataLoading && (
        <div className='d-flex align-items-center'>
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Loading data...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {user && data && (
        <div className='d-flex flex-row flex-wrap gap-3'>
          {
            Object.keys(boardCollection).map(key => {
              const board = boardCollection[key];
              if (board && typeof board === 'object') { 
                return (
                  <Boards 
                    key={key} 
                    uid={user.uid}
                    boardData={board} 
                    isOpen={openDropdown === board.deviceCode}
                    onToggle={() => handleToggleDropdown(board.deviceCode)}
                  />
                );
              }
              return null;
            })
          }
        </div>
      )}

      {user && !dataLoading && !error && !data && (
        <p>No data available. Please add some data to see it here.</p>
      )}
    </div>
  );
};

export default LandingPage;
