const backdrop = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : '/hero.png';

const HeroBanner = ({ movie, genresMap, onPlayTrailer, onMoreInfo, onToggleMyList, isInMyList }) => {
  if (!movie) {
    return <section className="hero-skeleton" />;
  }

  const metadata = [
    movie.release_date?.slice(0, 4),
    movie.runtime ? `${movie.runtime} min` : null,
    (movie.genre_ids || []).slice(0, 3).map((id) => genresMap[id]).filter(Boolean).join(', ')
  ].filter(Boolean);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img src={backdrop(movie.backdrop_path)} alt={movie.title} className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#16072f]/70 via-[#090312]/45 to-black/70" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />

      <div className="relative z-10 flex h-full items-end px-4 pb-24 md:px-12">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-left text-4xl font-black tracking-tight text-white md:text-6xl">{movie.title}</h1>
          <p className="text-sm text-white/80 md:text-base">{metadata.join(' · ')}</p>
          <p className="line-clamp-2 text-white/85">{movie.tagline || movie.overview || 'Discover your next cinematic obsession.'}</p>
          <div className="flex items-center gap-3 text-sm text-white/90">
            <span className="rounded-full bg-white/15 px-3 py-1">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{movie.vote_count || 0} votes</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => onPlayTrailer(movie)} className="rounded-full bg-white px-6 py-2 font-semibold text-black hover:bg-white/90">▶ Play Trailer</button>
            <button onClick={() => onToggleMyList(movie)} className="rounded-full border border-white/30 bg-white/10 px-6 py-2 font-semibold text-white hover:bg-white/20">{isInMyList ? '✓ In My List' : '➕ Add to My List'}</button>
            <button onClick={() => onMoreInfo(movie)} className="rounded-full border border-white/30 bg-white/10 px-6 py-2 font-semibold text-white hover:bg-white/20">ℹ More Info</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
