import React from "react";

export default function TrailerModal({ trailerUrl, onClose }) {
  if (!trailerUrl) return null;

  // Extract YouTube video ID from the URL
  const videoId = trailerUrl.split("v=")[1];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <iframe
          width="900"
          height="506"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube trailer"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ borderRadius: "18px", boxShadow: "0 4px 32px #000a", maxWidth: "90vw", maxHeight: "70vh" }}
        />
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(24, 18, 43, 0.95); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: #232044; padding: 2rem; border-radius: 24px; position: relative; box-shadow: 0 4px 32px #000a;
          min-width: 340px; max-width: 960px;
          display: flex; flex-direction: column; align-items: center;
        }
        .close-btn {
          position: absolute; top: 18px; right: 18px; background: #e50914; color: #fff; border: none; font-size: 2rem; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px #0005;
          transition: background 0.2s;
        }
        .close-btn:hover {
          background: #b00610;
        }
        @media (max-width: 1000px) {
          .modal-content { padding: 1rem; }
          iframe { width: 98vw !important; height: 56vw !important; }
        }
        @media (max-width: 600px) {
          .modal-content { padding: 0.5rem; border-radius: 10px; }
          .close-btn { top: 8px; right: 8px; width: 32px; height: 32px; font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
} 