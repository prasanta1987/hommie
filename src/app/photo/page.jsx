'use client';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FiPlus, FiSettings } from "react-icons/fi";

export default function InfiniteGallery() {
  const [images, setImages] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [selectedImg, setSelectedImg] = useState(null);
  const [newTags, setNewTags] = useState("");

  // New States for Upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTags, setUploadTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  useEffect(() => {
    setImages([]);
    setSkip(0);
    setHasMore(true);
  }, [selectedTag]);

  const fetchImages = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const tagQuery = selectedTag === "ALL" ? "" : `&tags=${selectedTag}`;
      const res = await fetch(`/api/photos?limit=12&skip=${skip}${tagQuery}`);
      const data = await res.json();
      const newImages = data.images || data;
      if (newImages.length < 12) setHasMore(false);
      setImages((prev) => [...prev, ...newImages]);
      setSkip((prev) => prev + 12);
      const uniqueTags = [...new Set([...availableTags, ...newImages.flatMap(img => img.tags || [])])];
      setAvailableTags(uniqueTags);
    } catch (error) { console.error(error); } finally { setLoading(false); }
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
    <div className="container-fluid pt-4">
      {/* UPLOAD BUTTON */}
      <button
        className="btn btn-success rounded shadow-sm"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          zIndex: 1050, // Higher than sticky filter bar (z-3)
          fontSize: '24px'
        }}
        data-bs-toggle="modal"
        data-bs-target="#uploadModal"
      >
        <FiPlus />
      </button>

      {/* 1. TOP FILTER BAR */}
      <div className="d-flex flex-wrap gap-2 justify-content-center mb-4 sticky-top bg-white py-3 border-bottom z-3">
        <button
          onClick={() => setSelectedTag("ALL")}
          className={`btn btn-sm rounded-pill px-4 ${selectedTag === "ALL" ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          ALL
        </button>
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`btn btn-sm rounded-pill px-3 ${selectedTag === tag ? 'btn-primary' : 'btn-outline-secondary'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 2. IMAGE GRID */}
      <div className="d-flex flex-wrap justify-content-evenly">
        {images.map((img, i) => (
          <div key={`${img.id}-${i}`} className="border p-1 position-relative d-flex flex-column cursor-pointer" onClick={() => setViewerIndex(i)}>
            <img src={img.thumbnailUrl} alt={img.name} className="w-full aspect-square object-cover" />
            <div
              role="button"
              className="position-absolute bottom-0 end-0 p-2 text-dark"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImg(img);
                setNewTags(img.tags.join(', '));
              }}
              data-bs-toggle="modal" data-bs-target="#settingsModal"
            >
              <FiSettings />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 z-10">
              <div className="flex flex-wrap gap-1">
                {img.tags?.map((tag, idx) => (
                  <span key={idx} className="badge bg-light text-dark text-[9px] uppercase">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

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

      <div ref={ref} className="h-40 flex items-center justify-center">
        {loading && <div className="spinner-border text-primary" />}
      </div>

      <Lightbox open={viewerIndex >= 0} index={viewerIndex} close={() => setViewerIndex(-1)} slides={images.map(img => ({ src: img.fullUrl }))} />
    </div>
  );
}
