import { useEffect, useState } from 'react';
import { fetchTrailerUrl } from '../utils/tmdb';
import { API_CONFIG } from '../config';

const TrailerModal = ({ movie, onClose }) => {
  const [trailerUrl, setTrailerUrl] = useState('');

  useEffect(() => {
    if (!movie) return;
    fetchTrailerUrl(movie.id, API_CONFIG.TMDB_API_KEY).then((url) => setTrailerUrl(url || ''));
  }, [movie]);

  useEffect(() => {
    if (!movie) return;
    const handleEsc = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [movie, onClose]);

  if (!movie) return null;

  const videoId = trailerUrl.split('v=')[1];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-6xl rounded-2xl border border-white/15 bg-[#120726]/70 p-4 backdrop-blur-lg transition-all duration-300 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{movie.title} — Trailer</h3>
          <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1">✕</button>
        </div>
        {videoId ? (
          <iframe
            className="h-[70vh] w-full rounded-xl"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Movie trailer"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="flex h-56 items-center justify-center rounded-xl bg-black/30 text-white/80">Trailer unavailable for this title.</div>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;
