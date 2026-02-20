const posterUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : '/no-movie.png';

const MovieCard = ({ movie, onPlayTrailer, onMoreInfo, onToggleMyList, isInMyList }) => (
  <article className="group relative overflow-visible">
    <button type="button" onClick={() => onMoreInfo(movie)} className="w-full overflow-hidden rounded-lg bg-[#130726] text-left shadow-[0_14px_35px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.05] group-hover:z-20 focus:outline-none">
      <img src={posterUrl(movie.poster_path)} alt={movie.title} loading="lazy" className="aspect-[2/3] w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/85 to-black/10 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex w-full items-center justify-between text-xs text-white">
          <span className="rounded-full bg-black/45 px-2 py-1">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-black/45 px-2 py-1">▶</span>
            <span className="rounded-full bg-black/45 px-2 py-1">{isInMyList ? '✓' : '➕'}</span>
            <span className="rounded-full bg-black/45 px-2 py-1">ℹ</span>
          </div>
        </div>
      </div>
    </button>

    <div className="mt-2 flex items-center justify-between gap-2 px-1">
      <p className="line-clamp-1 text-sm font-semibold text-white/90">{movie.title}</p>
      <div className="flex gap-1 text-white/85">
        <button onClick={() => onPlayTrailer(movie)} className="rounded bg-white/10 px-1.5 py-0.5 text-xs hover:bg-white/20">▶</button>
        <button onClick={() => onToggleMyList(movie)} className="rounded bg-white/10 px-1.5 py-0.5 text-xs hover:bg-white/20">{isInMyList ? '✓' : '➕'}</button>
      </div>
    </div>
  </article>
);

export default MovieCard;
