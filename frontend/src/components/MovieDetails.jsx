import { useEffect, useState } from 'react';
import { API_CONFIG, TMDB_API_OPTIONS } from '../config';

const MovieDetails = ({ movie, onClose, onPlayTrailer, onToggleMyList, isInMyList, onMoreInfo }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!movie) return;
    const fetchDetails = async () => {
      const [full, cast, images, videos, similar] = await Promise.all([
        fetch(`${API_CONFIG.TMDB_BASE_URL}/movie/${movie.id}?api_key=${API_CONFIG.TMDB_API_KEY}`, TMDB_API_OPTIONS).then((r) => r.json()),
        fetch(`${API_CONFIG.TMDB_BASE_URL}/movie/${movie.id}/credits?api_key=${API_CONFIG.TMDB_API_KEY}`, TMDB_API_OPTIONS).then((r) => r.json()),
        fetch(`${API_CONFIG.TMDB_BASE_URL}/movie/${movie.id}/images?api_key=${API_CONFIG.TMDB_API_KEY}`, TMDB_API_OPTIONS).then((r) => r.json()),
        fetch(`${API_CONFIG.TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${API_CONFIG.TMDB_API_KEY}`, TMDB_API_OPTIONS).then((r) => r.json()),
        fetch(`${API_CONFIG.TMDB_BASE_URL}/movie/${movie.id}/similar?api_key=${API_CONFIG.TMDB_API_KEY}`, TMDB_API_OPTIONS).then((r) => r.json())
      ]);
      setDetails({ full, cast: cast.cast || [], images: images.backdrops || [], videos: videos.results || [], similar: similar.results || [] });
    };
    fetchDetails().catch(() => setDetails(null));
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#04010d]/95" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="min-h-screen">
        <div className="relative h-[60vh] w-full">
          <img src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '/hero.png'} alt={movie.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04010d] via-[#04010d]/20 to-transparent" />
          <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-2">✕</button>
        </div>

        <div className="-mt-28 px-4 pb-16 md:px-10">
          <div className="rounded-2xl border border-white/10 bg-[#14092b]/65 p-6 backdrop-blur-md">
            <div className="flex flex-col gap-6 md:flex-row">
              <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-movie.png'} alt={movie.title} className="w-48 rounded-xl" />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">{movie.title}</h2>
                <p className="text-white/70">{details?.full?.release_date?.slice(0, 4)} · {details?.full?.runtime || '--'} min · ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</p>
                <div className="flex flex-wrap gap-2">{(details?.full?.genres || []).map((genre) => <span key={genre.id} className="rounded-full bg-white/10 px-3 py-1 text-xs">{genre.name}</span>)}</div>
                <p className="max-w-3xl text-white/85 line-clamp-4">{details?.full?.overview || movie.overview}</p>
                <div className="flex gap-3">
                  <button onClick={() => onPlayTrailer(movie)} className="rounded bg-white px-5 py-2 font-semibold text-black">▶ Play Trailer</button>
                  <button onClick={() => onToggleMyList(movie)} className="rounded bg-white/15 px-5 py-2">{isInMyList ? '✓ In My List' : '➕ Add to My List'}</button>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Cast</h3>
                <div className="hide-scrollbar flex gap-3 overflow-x-auto">
                  {details?.cast?.slice(0, 12).map((actor) => (
                    <div key={actor.id} className="min-w-[140px] rounded-lg bg-white/5 p-2">
                      <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/no-movie.png'} alt={actor.name} className="h-36 w-full rounded object-cover" loading="lazy" />
                      <p className="mt-2 line-clamp-1 text-sm">{actor.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">Media</h3>
                <div className="hide-scrollbar flex gap-3 overflow-x-auto">
                  {details?.videos?.slice(0, 8).map((video) => <div key={video.id} className="min-w-[220px] rounded-lg bg-white/10 p-3 text-sm">🎬 {video.name}</div>)}
                  {details?.images?.slice(0, 8).map((img) => <img key={img.file_path} src={`https://image.tmdb.org/t/p/w500${img.file_path}`} alt="Scene" className="h-32 min-w-[220px] rounded-lg object-cover" loading="lazy" />)}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">Similar Movies</h3>
                <div className="hide-scrollbar flex gap-3 overflow-x-auto">
                  {details?.similar?.slice(0, 12).map((similarMovie) => (
                    <button key={similarMovie.id} onClick={() => onMoreInfo(similarMovie)} className="min-w-[160px] text-left">
                      <img src={similarMovie.poster_path ? `https://image.tmdb.org/t/p/w500${similarMovie.poster_path}` : '/no-movie.png'} alt={similarMovie.title} className="aspect-[2/3] w-full rounded-lg object-cover" loading="lazy" />
                      <p className="mt-1 line-clamp-1 text-sm">{similarMovie.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
