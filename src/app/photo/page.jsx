'use client';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function InfiniteGallery() {
  const [images, setImages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [selectedImg, setSelectedImg] = useState(null); // For Modal
  const [newTags, setNewTags] = useState("");

  const { ref, inView } = useInView();

  const fetchImages = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/photos?limit=12&skip=${skip}`);
      const newData = await res.json();
      if (newData.length < 12) setHasMore(false);
      setImages((prev) => [...prev, ...newData]);
      setSkip((prev) => prev + 12);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { if (inView) fetchImages(); }, [inView]);

  const handleDelete = async (fileId) => {
    if (!confirm("Delete this image?")) return;
    const res = await fetch(`/api/photos/${fileId}`, { method: 'DELETE' });
    if (res.ok) {
      setImages(prev => prev.filter(img => img.id !== fileId));
      setSelectedImg(null);
    }
  };

  useEffect(() => {
    // Ensure the Bootstrap JS is loaded on the client side
    if (typeof document !== 'undefined') {
      require('bootstrap/dist/js/bootstrap.bundle.min.js');
    }
  }, []);

  const handleUpdateTags = async (fileId) => {
    const tagsArray = newTags.split(',').map(t => t.trim());
    const res = await fetch(`/api/photos/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ tags: tagsArray })
    });
    if (res.ok) {
      setImages(prev => prev.map(img => img.id === fileId ? { ...img, tags: tagsArray } : img));
      setSelectedImg(null);
    }
  };

  return (
    <div className="container-fluid pt-4">
      <div className="d-flex flex-wrap gap-4 justify-content-evenly">
        {images.map((img, i) => (
          <div key={`${img.id}-${i}`} className="relative group w-full sm:w-64 rounded-lg overflow-hidden bg-gray-100 shadow-sm border" onClick={() => setViewerIndex(i)}>
            <img src={img.thumbnailUrl} alt={img.name} className="w-full aspect-square object-cover" />

            {/* Settings Button */}
            <button
              className="absolute top-2 right-2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImg(img);
                setNewTags(img.tags.join(', '));
              }}
              data-bs-toggle="modal" data-bs-target="#settingsModal"
            >
              ⚙️
            </button>

            <div className="p-2">
              <div className="flex flex-wrap gap-1">
                {img.tags?.map((tag, idx) => (
                  <span key={idx} className="badge bg-secondary text-[10px]">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bootstrap Modal */}
      <div className="modal fade" id="settingsModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Image Settings</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Tags (comma separated)</label>
                <input type="text" className="form-control" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
              </div>
              <button className="btn btn-primary w-100 mb-2" onClick={() => handleUpdateTags(selectedImg?.id)}>Update Tags</button>
              <button className="btn btn-danger w-100" onClick={() => handleDelete(selectedImg?.id)}>Delete Image</button>
            </div>
          </div>
        </div>
      </div>

      <div ref={ref} className="h-20 flex items-center justify-center mt-4">
        {loading && <div className="spinner-border spinner-border-sm" />}
      </div>

      <Lightbox open={viewerIndex >= 0} index={viewerIndex} close={() => setViewerIndex(-1)} slides={images.map(img => ({ src: img.fullUrl }))} />
    </div>
  );
}
