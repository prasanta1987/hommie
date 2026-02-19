'use client';

import SignIn from '../components/sign-in';
import { Spinner } from 'react-bootstrap';
import LandingPage from './components/LandingPage';
import NoBoard from './ui/NoBoard';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';


export default function Home() {

  const { user, loading, error } = useAuth();
  const { data: dbData, loading: dataLoading, error: dataError } = useRTDB(
    user ? user.uid : null
  );


  if (loading || dataLoading) {
    return (
      <div className='text-center bg-dark flex-grow-1 d-flex justify-content-center align-items-center'>
        <Spinner animation="grow" variant="info" size="lg" />
      </div>
    );
  }

  if (error || dataError) {
    return <div>Error: {error?.message || dataError?.message}</div>
  }

  if (!user) {
    return <SignIn />;
  }

  if (user) {
    return (
      <>
        {
          dbData
            ? <LandingPage userDbData={dbData} userData={user} />
            : <NoBoard />
        }

        {/* <Footer userData={user.uid} /> */}
      </>
    );
  }

  return <SignIn />;
}
