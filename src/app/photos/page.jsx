'use client';
import InfiniteGallery from '@/photos/components/InfiniteGallery';

export default function TagPage() {

    return (
        <div className="container-fluid py-4">
            <InfiniteGallery initialTag="" />
        </div>
    );
}
