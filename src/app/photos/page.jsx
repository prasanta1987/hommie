'use client';
import InfiniteGallery from '@/app/photos/components/InfiniteGallery';
import SignIn from '@/app/components/sign-in';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';
import { Spinner } from 'react-bootstrap';

export default function TagPage() {

    const { user, loading, error } = useAuth();

    if (loading) {
        return (
            <div className='text-center bg-dark flex-grow-1 d-flex justify-content-center align-items-center'>
                <Spinner animation="grow" variant="info" size="lg" />
            </div>
        );
    }

    if (error) {
        return <div>Error</div>
    }

    if (!user) {
        return <SignIn />;
    }

    if (user) {
        return (
            <div className="container-fluid py-4 bg-dark">
                <InfiniteGallery initialTag="" />
            </div>
        );
    }


}
