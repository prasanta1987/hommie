
'use client';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FiPlus, FiSettings } from "react-icons/fi";

export default function InfiniteGallery({ initialTag = "ALL" }) {
    const [images, setImages] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(initialTag);
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

    useEffect(() => {
        if (typeof document !== 'undefined') require('bootstrap/dist/js/bootstrap.bundle.min.js');
        // Fetch all available tags from your separate route
        fetch('/api/tags').then(res => res.json()).then(setAvailableTags);
    }, []);

    // Sync state when initialTag prop changes (e.g., via URL navigation)
    useEffect(() => { setSelectedTag(initialTag); }, [initialTag]);

    // Reset gallery when tag changes
    useEffect(() => {
        setImages([]); setSkip(0); setHasMore(true);
        // Update URL to match selected tag without reload
        if (selectedTag && selectedTag !== initialTag) {
            const path = selectedTag === "ALL" ? "/photo/" : `/photo/${encodeURIComponent(selectedTag)}`;
            window.history.pushState(null, '', path);
        }
    }, [selectedTag]);

    const fetchImages = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const tagParam = (selectedTag && selectedTag !== "ALL") ? `&tags=${encodeURIComponent(selectedTag)}` : "";
            const res = await fetch(`/api/photos?limit=12&skip=${skip}${tagParam}`);
            const data = await res.json();
            if (data.length < 12) setHasMore(false);
            setImages(prev => [...prev, ...data]);
            setSkip(prev => prev + 12);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { if (inView) fetchImages(); }, [inView, selectedTag]);

    // Upload Logic
    const handleUpload = async () => {
        if (!uploadFile) return alert("Please select a file first.");
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("tags", uploadTags);

        try {
            const res = await fetch('/api/photos', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const newImg = await res.json();
                // Add new image to the start of the grid
                setImages(prev => [newImg, ...prev]);
                // Update tags list if new tags were added
                const updatedTags = [...new Set([...availableTags, ...newImg.tags])];
                setAvailableTags(updatedTags);

                // Reset form
                setUploadFile(null);
                setUploadTags("");
                alert("Upload successful!");
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateTags = async () => {
        if (!selectedImg) return;
        const tagsArray = newTags.split(',').map(t => t.trim()).filter(t => t !== "");
        try {
            const res = await fetch(`/api/photos/${selectedImg.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: tagsArray })
            });
            if (res.ok) {
                setImages(prev => prev.map(img => img.id === selectedImg.id ? { ...img, tags: tagsArray } : img));
                const updatedGlobalTags = [...new Set([...availableTags, ...tagsArray])];
                setAvailableTags(updatedGlobalTags);
            }
        } catch (err) { console.error("Update failed", err); }
    };

    const handleDeleteImage = async () => {
        if (!selectedImg || !confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/photos/${selectedImg.id}`, { method: 'DELETE' });
            if (res.ok) setImages(prev => prev.filter(img => img.id !== selectedImg.id));
        } catch (err) { console.error("Delete failed", err); }
    };


    return (
        <div className="container-fluid pt-2">
            {/* Tag Filter Bar */}
            <div className="d-flex flex-wrap gap-2 justify-content-center mb-4 sticky-top bg-white py-3 border-bottom z-3">
                <button onClick={() => setSelectedTag("ALL")} className={`btn btn-sm rounded-pill px-4 ${selectedTag === "ALL" ? 'btn-primary' : 'btn-outline-primary'}`}>ALL</button>
                {availableTags.map(t => (
                    <button key={t} onClick={() => setSelectedTag(t)} className={`btn btn-sm rounded-pill px-3 ${selectedTag === t ? 'btn-primary' : 'btn-outline-secondary'}`}>{t}</button>
                ))}
            </div>

            {/* Modern Grid */}
            <div className="row g-4 px-2">
                {images.map((img, i) => (
                    <div key={`${img.id}-${i}`} className="col-6 col-md-4 col-lg-3 col-xl-2">
                        <div className="card h-100 border-0 shadow-sm overflow-hidden position-relative group cursor-pointer" onClick={() => setViewerIndex(i)}>
                            <img src={img.thumbnailUrl} className="card-img-top object-cover aspect-square" alt="" />
                            {/* Modern Corner Settings Icon */}
                            <div
                                role="button"
                                className="position-absolute top-0 end-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: 'radial-gradient(circle at top right, rgba(37,59,46,0.9) 0%, transparent 70%)', zIndex: 20 }}
                                onClick={(e) => { e.stopPropagation(); setSelectedImg(img); setNewTags(img.tags.join(', ')); }}
                                data-bs-toggle="modal" data-bs-target="#settingsModal"
                            >
                                <FiSettings size={20} />
                            </div>
                            {/* Bottom Tags */}
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
            <button
                className="btn btn-success rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center"
                style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }}
                data-bs-toggle="modal" data-bs-target="#uploadModal"
            >
                <FiPlus size={28} />
            </button>

            {/* Sentinel, Lightbox & Modals go here... */}
            <div ref={ref} className="h-40 flex items-center justify-center mt-4">
                {loading && <div className="spinner-border text-primary" />}
            </div>
            <Lightbox open={viewerIndex >= 0} index={viewerIndex} close={() => setViewerIndex(-1)} slides={images.map(img => ({ src: img.fullUrl }))} />

            {/* UPLOAD MODAL */}
            <div className="modal fade" id="uploadModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Upload Photo</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="file" className="form-control mb-3"
                                accept="image/*"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                            />
                            <input
                                type="text" className="form-control mb-3"
                                placeholder="Tags (comma separated)"
                                value={uploadTags}
                                onChange={(e) => setUploadTags(e.target.value)}
                            />
                            <button
                                className="btn btn-primary w-100"
                                onClick={handleUpload}
                                disabled={isUploading}
                                data-bs-dismiss={!isUploading ? "modal" : ""}
                            >
                                {isUploading ? "Uploading..." : "Upload Image"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SETTINGS MODAL */}
            <div className="modal fade" id="settingsModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Settings</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <input type="text" className="form-control mb-3" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="Tags (comma separated)" />
                            <button className="btn btn-primary w-100 mb-2" onClick={handleUpdateTags} data-bs-dismiss="modal">Update Tags</button>
                            <button className="btn btn-danger w-100" onClick={handleDeleteImage} data-bs-dismiss="modal">Delete Image</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
