'use client';

import { Spinner } from 'react-bootstrap';
import LandingPage from './components/LandingPage';
import NoBoard from './ui/NoBoard';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';
import SignIn from '@/app/components/sign-in';

export default function Home() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { data: dbData, loading: dataLoading, error: dataError } = useRTDB(
    user ? user.uid : null
  );

  const loading = authLoading || (user && dataLoading);
  const error = authError || dataError;

  if (loading) {
    return (
      <div className='text-center bg-dark flex-grow-1 d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
        <Spinner animation="grow" variant="info" size="lg" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  // Get the list of devices from the /devices key
  const deviceList = dbData?.devices;

  // Reconstruct the data structure expected by the downstream components
  const userDbData = {};
  if (deviceList && dbData) {
    Object.keys(deviceList).forEach(deviceCode => {
      // Combine device metadata from /devices with feed data from /<deviceCode>
      userDbData[deviceCode] = {
        ...(dbData[deviceCode] || {}), // Contains devFeeds
        ...deviceList[deviceCode],    // Contains deviceName, deviceType
        deviceCode: deviceCode,       // Ensure deviceCode is present
      };
    });
  }

  const hasData = dbData && Object.keys(userDbData).length > 0;

  return (
    <>
      {hasData ? (
        <LandingPage userDbData={userDbData} userData={user} />
      ) : (
        <NoBoard uid={user.uid} />
      )}
    </>
  );
}
