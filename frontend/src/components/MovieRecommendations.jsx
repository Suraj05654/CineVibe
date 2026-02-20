import { useEffect, useRef, useState } from 'react';
import { API_CONFIG } from '../config';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const normalizeRecommendations = (payload) => {
  const candidates = payload?.recommendations || payload?.results || [];
  if (!Array.isArray(candidates)) return { inputMovie: payload?.input_movie || payload?.inputMovie || '', recommendations: [] };
  return {
    inputMovie: payload?.input_movie || payload?.inputMovie || '',
    recommendations: candidates.map((movie) => ({
      id: movie.id,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      overview: movie.overview
    })).filter((movie) => movie.id)
  };
};

const MovieRecommendations = ({ onRecommendationsLoaded, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setSuggestions((data.results || []).slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isModalOpen]);

  const getRecommendations = async (movieTitle) => {
    if (!movieTitle?.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const uid = user?.$id ?? 'guest';
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie_title: movieTitle, num_recommendations: 12, uid })
      });
      if (!response.ok) throw new Error('Could not fetch recommendations.');
      const data = await response.json();
      const normalized = normalizeRecommendations(data);
      onRecommendationsLoaded(normalized);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-[#130726]/60 p-5 backdrop-blur-md">
        <p className="text-lg font-semibold">Liked something recently? Tell us one movie.</p>
        <p className="mt-1 text-sm text-white/70">We’ll craft a cinematic row tailored to your taste.</p>
        <button onClick={() => setIsModalOpen(true)} className="mt-4 rounded-xl bg-gradient-to-r from-violet-200 to-indigo-300 px-5 py-2 font-semibold text-[#180531]">Get Suggestions</button>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#120726]/80 p-5 backdrop-blur-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Pick one movie you enjoyed</h3>
            <input
              ref={inputRef}
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type a movie title"
              className="mt-3 w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3 outline-none"
            />
            <div className="mt-2 space-y-1">
              {suggestions.map((movie) => (
                <button key={movie.id} onClick={() => getRecommendations(movie.title)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-white/10">
                  {movie.poster_path && <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} className="h-12 w-8 rounded object-cover" />}
                  <span>{movie.title}</span>
                </button>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
            <button onClick={() => getRecommendations(searchTerm)} disabled={isLoading || !searchTerm.trim()} className="mt-4 rounded-xl bg-white px-4 py-2 font-semibold text-black disabled:opacity-60">
              {isLoading ? 'Finding...' : 'Build Recommendations'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieRecommendations;
