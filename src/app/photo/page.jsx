'use client';
import { useEffect, useState } from 'react';

export default function Gallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('/api/photos')
      .then(res => res.json())
      .then(setImages);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      {images.map((img) => (
        <div key={img.id} className="rounded overflow-hidden bg-gray-200">
          <a href={img.fullUrl} target="_blank">
            <img 
              src={img.thumbnailUrl}
              alt={img.name} 
              className="w-full h-full object-cover"
              loading="lazy" 
            />
          </a>
        </div>
      ))}
    </div>
  );
}
