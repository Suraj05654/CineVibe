import { useState } from 'react';
import MovieCard from './MovieCard';

const ContentRow = ({ title, movies, genresMap, onPlayTrailer, onMoreInfo, onToggleMyList, isInMyList, onRequireLogin, user, sectionId }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const visibleMovies = movies.slice(0, visibleCount);

  const handleScroll = (event) => {
    const { scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
    if (scrollLeft + clientWidth > scrollWidth - 240 && visibleCount < movies.length) {
      setVisibleCount((count) => Math.min(count + 6, movies.length));
    }
  };

  return (
    <section className="space-y-4" id={sectionId}>
      <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
      <div onScroll={handleScroll} className="hide-scrollbar overflow-x-auto overflow-y-visible px-1 py-4">
        <div className="flex flex-nowrap gap-x-4 md:gap-x-5">
          {visibleMovies.map((movie) => (
            <div key={movie.id} className="min-w-[150px] md:min-w-[180px] lg:min-w-[200px]">
              <MovieCard
                movie={movie}
                genresMap={genresMap}
                onPlayTrailer={onPlayTrailer}
                onMoreInfo={onMoreInfo}
                onToggleMyList={onToggleMyList}
                isInMyList={isInMyList(movie.id)}
                onRequireLogin={onRequireLogin}
                user={user}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentRow;
