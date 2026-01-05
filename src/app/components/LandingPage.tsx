
'use client';

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { auth, db } from '../firebase/config';
import { ref } from "firebase/database";

const LandingPage = () => {
  const [user] = useAuthState(auth);
  console.log(user?.uid)
  const dbPath = user?.uid;

  const [data, loading, error] = useObjectVal(ref(db, dbPath));

  return (
    <div className='container flex-grow-1 overflow-auto mt-5'>
      <div className="card">
        <div className="card-header">
          <h1>Hi, {user ? user.email : 'Guest'}</h1>
        </div>
        <div className="card-body">
          <h5 className="card-title">Realtime Data from Firebase</h5>
          {error && <strong>Error: {error.message}</strong>}
          {loading && <span>Loading data...</span>}
          {!loading && data && (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
          {!loading && !data && (
            <p>No data available at the &apos;{dbPath}&apos; path in your database. Please add some data to see it here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
