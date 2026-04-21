'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FiPlus, FiSettings } from "react-icons/fi";
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';
import { Modal, Form, Button } from 'react-bootstrap';
import UploadModal from '@/app/photos/ui/UploadModal';
import SettingsModal from '@/app/photos/ui/SettingsModal';

export default function InfiniteGallery() {
    const params = useParams();
    // Derive tag from URL. If on home page, default to ALL.
    const urlTag = params?.tag ? decodeURIComponent(params.tag) : "ALL";

    const [images, setImages] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [viewerIndex, setViewerIndex] = useState(-1);
    const [selectedImg, setSelectedImg] = useState(null);
    const [newTags, setNewTags] = useState("");
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTags, setUploadTags] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);


    const { ref, inView } = useInView();

    const { user, loading: authLoading } = useAuth();
    const { data: apiKey, loading: dataLoading } = useRTDB(
        user ? `userCred/UIDtoAPI/${user.uid}/fbAPIKey` : null
    );


    // Load Bootstrap and Global Tags
    useEffect(() => {
        if (typeof document !== 'undefined') require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, []);

    // RESET Gallery whenever the URL Tag changes
    useEffect(() => {
        setImages([]);
        setSkip(0);
        setHasMore(true);
    }, [urlTag]);

    const fetchImages = async () => {
        if (loading || !hasMore || !apiKey) return;
        setLoading(true);
        try {
            const tagParam = urlTag === "ALL" ? "" : `&tags=${encodeURIComponent(urlTag)}`;
            const res = await fetch(`/api/photos?apiKey=${apiKey}&limit=12&skip=${skip}${tagParam}`);
            const data = await res.json();
            if (data.length < 12) setHasMore(false);
            setImages(prev => [...prev, ...data]);
            setSkip(prev => prev + 12);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };


    useEffect(() => {
        // Only fetch if the element is in view and we have the necessary API key data
        if (inView && apiKey && !loading && hasMore) {
            fetch(`/api/photos/tags?apiKey=${apiKey}`).then(res => res.json()).then(setAvailableTags);
            fetchImages();
        }
    }, [inView, apiKey, images.length],);

    // Handlers
    const handleUpload = async () => {

        if (!uploadFile) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile[0]);
        formData.append("tags", uploadTags);
        const res = await fetch(`/api/photos?apiKey=${apiKey}`, { method: 'POST', body: formData });
        if (res.ok) {
            const newImg = await res.json();
            setImages(p => [newImg, ...p]);
            setUploadTags(""); setUploadFile(null);
        }
        setIsUploading(false);
        setShowUploadModal(false)
    };

    const handleUpdateTags = async () => {
        setIsUpdating(true)
        const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t !== "");
        const res = await fetch(`/api/photos/${selectedImg.id}?apiKey=${apiKey}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags: tagsArray })
        });
        if (res.ok) setImages(p => p.map(img => img.id === selectedImg.id ? { ...img, tags: tagsArray } : img));
        setShowSettingsModal(false);
        setIsUpdating(false)
    };

    const handleDeleteImage = async () => {
        if (!confirm("Delete?")) return;
        setIsDeleting(true)
        const res = await fetch(`/api/photos/${selectedImg.id}?apiKey=${apiKey}`, { method: 'DELETE' });
        if (res.ok) setImages(p => p.filter(img => img.id !== selectedImg.id));
        setShowSettingsModal(false);
        setIsDeleting(false)
    };

    const handleClose = () => {
        setShowUploadModal(false);
        setShowSettingsModal(false);
    };

    return (
        <div className="container-fluid pt-2 position-relative">

            {/* Tag Filter Bar with Next.js Links */}
            <div className="d-flex flex-wrap gap-2 justify-content-center mb-4 sticky-top bg-dark py-3 border-bottom z-3">
                <Link href="/photos" className={`btn btn-sm rounded-pill px-4 ${urlTag === "ALL" ? 'btn-primary' : 'btn-outline-primary'}`}>
                    ALL
                </Link>
                {availableTags.map(t => (
                    <Link key={t} href={`/photos/${encodeURIComponent(t)}`} className={`btn btn-sm rounded-pill px-3 ${urlTag === t ? 'btn-primary' : 'btn-outline-secondary'}`}>
                        {t}
                    </Link>
                ))}
            </div>

            {/* Modern Grid */}
            <div className="row g-4 px-2">
                {images.map((img, i) => (
                    <div key={`${img.id}-${i}`} className="col-6 col-md-4 col-lg-3 col-xl-3">
                        <div className="card h-100 border-0 shadow-sm overflow-hidden position-relative group cursor-pointer" onClick={() => setViewerIndex(i)}>
                            <img src={img.thumbnailUrl} className="card-img-top object-cover aspect-square border" alt="" />
                            <div
                                role="button"
                                className="position-absolute top-0 end-0 p-1"
                                style={{ background: 'radial-gradient(circle at top right, rgba(37,59,46,0.9) 0%, transparent 70%)' }}
                                onClick={(e) => { e.stopPropagation(); setSelectedImg(img); setNewTags(img.tags.join(', ')); }}
                            >
                                <FiSettings size={20} color="red" onClick={() => setShowSettingsModal(true)} />
                            </div>
                            <small className="position-absolute bottom-0 start-0 end-0 p-1 bg-black/60 z-10">
                                <div className="d-flex flex-wrap gap-1">
                                    {img.tags?.map((t, idx) => <span key={idx} className="badge bg-light text-dark">{t}</span>)}
                                </div>
                            </small>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Add Button */}
            <button className="btn btn-success rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center"
                style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }}
                onClick={() => setShowUploadModal(true)}
            >
                <FiPlus size={28} />
            </button>

            {/* Sentinel */}
            <div ref={ref} className="w-100 h-40 d-flex justify-content-center mt-4">
                {loading && <div className="spinner-border text-primary" />}
            </div>

            {/* Modals & Lightbox */}
            <Lightbox open={viewerIndex >= 0} index={viewerIndex} close={() => setViewerIndex(-1)} slides={images.map(img => ({ src: img.fullUrl }))} />

            <UploadModal
                showUploadModal={showUploadModal}
                handleClose={handleClose}
                setUploadFile={setUploadFile}
                setUploadTags={setUploadTags}
                handleUpload={handleUpload}
                isUploading={isUploading}
            />

            <SettingsModal
                showSettingsModal={showSettingsModal}
                handleClose={handleClose}
                setNewTags={setNewTags}
                handleUpdateTags={handleUpdateTags}
                handleUpload={handleUpload}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                handleDeleteImage={handleDeleteImage}
                newTags={newTags}
            />
        </div>
    );
}
