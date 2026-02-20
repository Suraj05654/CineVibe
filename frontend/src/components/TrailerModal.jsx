import React from 'react'

export default function TrailerModal({ trailerUrl, onClose }) {
  if (!trailerUrl) return null

  const [, query = ''] = trailerUrl.split('?')
  const params = new URLSearchParams(query)
  const videoId = params.get('v')
  if (!videoId) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trailer-modal" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close trailer">
          ✕
        </button>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
          title="YouTube trailer"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="trailer-frame"
        />
      </div>
    </div>
  )
}
