import React from 'react'

export default function TrailerModal({ trailerUrl, onClose }) {
  if (!trailerUrl) return null

  const [, query = ''] = trailerUrl.split('?')
  const params = new URLSearchParams(query)
  const videoId = params.get('v')

  if (!videoId) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close trailer">
          ✕
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube trailer"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="trailer-frame"
        />
      </div>
    </div>
  )
}
