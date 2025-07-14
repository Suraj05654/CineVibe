import React, { useEffect, useState } from "react";
import TrailerModal from "./TrailerModal";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function fetchTrailerUrl(movieId, apiKey) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch trailer");
    const data = await response.json();
    const trailer = data.results.find(
      (vid) => vid.site === "YouTube" && vid.type === "Trailer"
    );
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
}

export default function MovieCard({ movie }) {
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchTrailerUrl(movie.id, TMDB_API_KEY)
      .then(url => {
        if (isMounted) setTrailerUrl(url);
        // Debug output:
        console.log("Movie:", movie.title, "ID:", movie.id, "Trailer URL:", url);
      })
      .catch(() => {
        if (isMounted) setTrailerUrl(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [movie.id]);

  return (
    <div className="movie-card flex flex-col items-center w-full h-full">
      <img
        src={movie.poster_path ?
          `https://image.tmdb.org/t/p/w500${movie.poster_path.startsWith('/') ? movie.poster_path : '/' + movie.poster_path}` : '/no-movie.png'}
        alt={movie.title}
        className="rounded-lg w-full aspect-[2/3] object-cover mb-4 shadow-md"
      />

      <div className="w-full flex flex-col flex-1">
        <h3 className="text-white font-bold text-lg text-center mb-1 line-clamp-1">{movie.title}</h3>

        <div className="content mt-2 flex flex-row items-center justify-center flex-wrap gap-2 mb-4">
          <div className="rating flex flex-row items-center gap-1">
            <img src="star.svg" alt="Star Icon" className="size-4 object-contain" />
            <p className="font-bold text-base text-white">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span className="text-sm text-gray-100">•</span>
          <p className="lang capitalize text-gray-100 font-medium text-base">{movie.original_language}</p>
          <span className="text-sm text-gray-100">•</span>
          <p className="year text-gray-100 font-medium text-base">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
        </div>
        {loading ? (
          <button disabled className="mt-auto w-full bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary font-bold py-2 rounded-lg opacity-70 cursor-not-allowed">Loading...</button>
        ) : trailerUrl ? (
          <>
            <button onClick={() => setShowModal(true)} className="mt-auto w-full bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary font-bold py-2 rounded-lg hover:opacity-90 transition-opacity shadow-md">Play Trailer</button>
            {showModal && (
              <TrailerModal
                trailerUrl={trailerUrl}
                onClose={() => setShowModal(false)}
              />
            )}
          </>
        ) : (
          <button disabled className="mt-auto w-full bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary font-bold py-2 rounded-lg opacity-70 cursor-not-allowed">No Trailer Available</button>
        )}
      </div>
    </div>
  );
}
