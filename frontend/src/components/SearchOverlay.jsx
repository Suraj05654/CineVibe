import ContentRow from './ContentRow';

const SearchOverlay = ({ isOpen, onClose, searchTerm, setSearchTerm, results, genresMap, onPlayTrailer, onMoreInfo, onToggleMyList, isInMyList, onRequireLogin, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#04010d]/96 p-4 backdrop-blur-md md:p-8" onClick={onClose}>
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#120726]/70 p-4 backdrop-blur-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movies, genres, vibes..."
            className="w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet-300"
          />
          <button onClick={onClose} className="rounded-lg bg-white/10 px-4 py-3">Close</button>
        </div>

        {searchTerm.trim() && (
          <ContentRow
            title="Search Results"
            movies={results}
            genresMap={genresMap}
            onPlayTrailer={onPlayTrailer}
            onMoreInfo={onMoreInfo}
            onToggleMyList={onToggleMyList}
            isInMyList={isInMyList}
            onRequireLogin={onRequireLogin}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
