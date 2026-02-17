'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FiPlus, FiSettings } from "react-icons/fi";

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

    const { ref, inView } = useInView();

    // Load Bootstrap and Global Tags
    useEffect(() => {
        if (typeof document !== 'undefined') require('bootstrap/dist/js/bootstrap.bundle.min.js');
        fetch('/api/tags').then(res => res.json()).then(setAvailableTags);
    }, []);

    // RESET Gallery whenever the URL Tag changes
    useEffect(() => {
        setImages([]);
        setSkip(0);
        setHasMore(true);
    }, [urlTag]);

    const fetchImages = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const tagParam = urlTag === "ALL" ? "" : `&tags=${encodeURIComponent(urlTag)}`;
            const res = await fetch(`/api/photos?limit=12&skip=${skip}${tagParam}`);
            const data = await res.json();
            if (data.length < 12) setHasMore(false);
            setImages(prev => [...prev, ...data]);
            setSkip(prev => prev + 12);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (inView) fetchImages();
    }, [inView, urlTag, skip]);

    // Handlers
    const handleUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile[0]);
        formData.append("tags", uploadTags);
        const res = await fetch('/api/photos', { method: 'POST', body: formData });
        if (res.ok) {
            const newImg = await res.json();
            setImages(p => [newImg, ...p]);
            setUploadTags(""); setUploadFile(null);
        }
        setIsUploading(false);
    };

    const handleUpdateTags = async () => {
        const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t !== "");
        const res = await fetch(`/api/photos/${selectedImg.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags: tagsArray })
        });
        if (res.ok) setImages(p => p.map(img => img.id === selectedImg.id ? { ...img, tags: tagsArray } : img));
    };

    const handleDeleteImage = async () => {
        if (!confirm("Delete?")) return;
        const res = await fetch(`/api/photos/${selectedImg.id}`, { method: 'DELETE' });
        if (res.ok) setImages(p => p.filter(img => img.id !== selectedImg.id));
    };

    return (
        <div className="container-fluid pt-2 position-relative">
            {/* Tag Filter Bar with Next.js Links */}
            <div className="d-flex flex-wrap gap-2 justify-content-center mb-4 sticky-top bg-white py-3 border-bottom z-3">
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
                    <div key={`${img.id}-${i}`} className="col-6 col-md-4 col-lg-3 col-xl-2">
                        <div className="card h-100 border-0 shadow-sm overflow-hidden position-relative group cursor-pointer" onClick={() => setViewerIndex(i)}>
                            <img src={img.thumbnailUrl} className="card-img-top object-cover aspect-square" alt="" />
                            <div
                                role="button"
                                className="position-absolute top-0 end-0 p-1"
                                style={{ background: 'radial-gradient(circle at top right, rgba(37,59,46,0.9) 0%, transparent 70%)', zIndex: 20 }}
                                onClick={(e) => { e.stopPropagation(); setSelectedImg(img); setNewTags(img.tags.join(', ')); }}
                                data-bs-toggle="modal" data-bs-target="#settingsModal"
                            >
                                <FiSettings size={20} color="red" />
                            </div>
                            <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-black/60 z-10">
                                <div className="d-flex flex-wrap gap-1">
                                    {img.tags?.map((t, idx) => <span key={idx} className="badge bg-light text-dark text-[9px] uppercase">{t}</span>)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Add Button */}
            <button className="btn btn-success rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center"
                style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }}
                data-bs-toggle="modal" data-bs-target="#uploadModal">
                <FiPlus size={28} />
            </button>

            {/* Sentinel */}
            <div ref={ref} className="w-100 h-40 flex items-center justify-center mt-4">
                {loading && <div className="spinner-border text-primary" />}
            </div>

            {/* Modals & Lightbox */}
            <Lightbox open={viewerIndex >= 0} index={viewerIndex} close={() => setViewerIndex(-1)} slides={images.map(img => ({ src: img.fullUrl }))} />

            <div className="modal fade" id="uploadModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content"><div className="modal-header"><h5>Upload Photo</h5><button className="btn-close" data-bs-dismiss="modal"></button></div><div className="modal-body">
                    <input type="file" className="form-control mb-3" onChange={(e) => setUploadFile(e.target.files)} />
                    <input type="text" className="form-control mb-3" placeholder="Tags (comma separated)" value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} />
                    <button className="btn btn-primary w-100" onClick={handleUpload} disabled={isUploading} data-bs-dismiss="modal">{isUploading ? 'Uploading...' : 'Start Upload'}</button>
                </div></div></div>
            </div>

            <div className="modal fade" id="settingsModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content"><div className="modal-header"><h5>Settings</h5><button className="btn-close" data-bs-dismiss="modal"></button></div><div className="modal-body">
                    <input type="text" className="form-control mb-3" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                    <button className="btn btn-primary w-100 mb-2" onClick={handleUpdateTags} data-bs-dismiss="modal">Update Tags</button>
                    <button className="btn btn-danger w-100" onClick={handleDeleteImage} data-bs-dismiss="modal">Delete Image</button>
                </div></div></div>
            </div>
        </div>
    );
}
