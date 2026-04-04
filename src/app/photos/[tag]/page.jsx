'use client';
import { useParams } from 'next/navigation';
import InfiniteGallery from '@/app/photos/components/InfiniteGallery';

export default function TagPage() {
    const params = useParams();
    // Decodes tags like "New%20York" into "New York"
    const tag = params?.tag ? decodeURIComponent(params.tag) : "ALL";

    return (
        <div className="container-fluid py-4">
            <h2 className="text-center text-uppercase fw-bold mb-4">
                Category: {tag}
            </h2>
            {/* Pass the dynamic tag into your existing gallery component */}
            <InfiniteGallery initialTag={tag} />
        </div>
    );
}
