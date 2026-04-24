'use client';

import { Spinner } from 'react-bootstrap';
import LandingPage from './components/LandingPage';
import NoBoard from './ui/NoBoard';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';
import SignIn from '@/app/components/sign-in';

export default function Home() {
  const { user, loading, error } = useAuth();
  const { data: dbData, loading: dataLoading, error: dataError } = useRTDB(
    user ? user.uid : null
  );

  if (loading || (user && dataLoading)) {
    return (
      <div className='text-center bg-dark flex-grow-1 d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
        <Spinner animation="grow" variant="info" size="lg" />
      </div>
    );
  }

  if (error || dataError) {
    return <div>Error: {error?.message || dataError?.message}</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  // Define your filters
  const keyFilters = ["devices"];

  // Perform the filtering in the main scope of the function
  const filteredData = dbData
    ? Object.keys(dbData)
        .filter((key) => !keyFilters.includes(key))
        .reduce((obj, key) => {
          obj[key] = dbData[key];
          return obj;
        }, {})
    : null;

  // Check if we have valid filtered data to render
  const hasData = filteredData && Object.keys(filteredData).length > 0;

  return (
    <>
      {hasData ? (
        <LandingPage userDbData={filteredData} userData={user} />
      ) : (
        <NoBoard />
      )}
      {/* <Footer userData={user.uid} /> */}
    </>
  );
}