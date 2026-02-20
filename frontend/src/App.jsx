import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ContentRow from './components/ContentRow';
import TrailerModal from './components/TrailerModal';
import MovieDetails from './components/MovieDetails';
import SearchOverlay from './components/SearchOverlay';
import MovieRecommendations from './components/MovieRecommendations';
import LoginModal from './components/LoginModal';
import { API_CONFIG, TMDB_API_OPTIONS } from './config';
import { authService } from './services/appwriteAuth';

const API_BASE = API_CONFIG.TMDB_BASE_URL;
const API_KEY = API_CONFIG.TMDB_API_KEY;

const buildPoster = (path, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '/no-movie.png';

const createRowConfig = (recommendationData, recommendationSourceMovie) => [
  { key: 'trending', title: 'Trending Now', endpoint: `${API_BASE}/trending/movie/week?api_key=${API_KEY}` },
  { key: 'topRated', title: 'Top Rated', endpoint: `${API_BASE}/movie/top_rated?api_key=${API_KEY}` },
  { key: 'india', title: 'Popular in India', endpoint: `${API_BASE}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&watch_region=IN&region=IN` },
  { key: 'new', title: 'New Releases', endpoint: `${API_BASE}/discover/movie?api_key=${API_KEY}&sort_by=release_date.desc&primary_release_date.lte=${new Date().toISOString().split('T')[0]}` },
  ...(recommendationData.length > 0 ? [{
    key: 'becauseYouWatched',
    title: recommendationSourceMovie ? `Because You Watched ${recommendationSourceMovie}` : 'Because You Watched',
    items: recommendationData
  }] : []),
  { key: 'recommended', title: 'Recommended For You', endpoint: `${API_BASE}/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=5000` }
].filter((row) => row.endpoint || row.items?.length);

const App = () => {
  const [rows, setRows] = useState({});
  const [genresMap, setGenresMap] = useState({});
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerTarget, setTrailerTarget] = useState(null);
  const [myList, setMyList] = useState([]);
  const [recommendationData, setRecommendationData] = useState([]);
  const [recommendationSourceMovie, setRecommendationSourceMovie] = useState('');
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const myListRef = useRef(null);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 450, [searchTerm]);

  const refreshWishlist = async (activeUser = user) => {
    if (!activeUser?.$id) {
      setMyList([]);
      return;
    }

    try {
      const list = await authService.getWishlist(activeUser.$id);
      setMyList(Array.isArray(list) ? list : []);
    } catch {
      setMyList([]);
    }
  };

  useEffect(() => {
    authService.getUser().then(async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.$id) {
        await refreshWishlist(currentUser);
      }
    });
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const genreRes = await fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}`, TMDB_API_OPTIONS);
      const genreData = await genreRes.json();
      const map = Object.fromEntries((genreData.genres || []).map((genre) => [genre.id, genre.name]));
      setGenresMap(map);

      const rowConfig = createRowConfig(recommendationData, recommendationSourceMovie);
      const rowResponses = await Promise.all(
        rowConfig.filter((row) => row.endpoint).map((row) => fetch(row.endpoint, TMDB_API_OPTIONS).then((res) => res.json()))
      );

      const fetchedRows = {};
      let dataPointer = 0;
      rowConfig.forEach((row) => {
        if (row.items) {
          fetchedRows[row.key] = row.items;
          return;
        }
        fetchedRows[row.key] = rowResponses[dataPointer]?.results || [];
        dataPointer += 1;
      });
      setRows(fetchedRows);
    };

    fetchInitialData().catch((error) => console.error('Failed loading homepage data', error));
  }, []);

  useEffect(() => {
    setRows((current) => ({
      ...current,
      becauseYouWatched: recommendationData
    }));
  }, [recommendationData]);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const runSearch = async () => {
      try {
        const response = await fetch(`${API_BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(debouncedSearchTerm)}`, TMDB_API_OPTIONS);
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Failed searching movies', error);
        setSearchResults([]);
      }
    };

    runSearch();
  }, [debouncedSearchTerm]);

  const featuredPool = rows.trending || [];
  const featuredMovie = featuredPool[featuredIndex % Math.max(featuredPool.length, 1)];

  useEffect(() => {
    if (!featuredPool.length) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPool.length);
    }, 9000);

    return () => clearInterval(interval);
  }, [featuredPool.length]);

  const isInMyList = (movieId) => myList.some((item) => item.id === movieId);

  const requireLogin = () => setIsLoginOpen(true);

  const toggleMyList = async (movie) => {
    if (!user?.$id) {
      requireLogin();
      return;
    }

    const next = await authService.toggleWishlist(user.$id, movie);
    setMyList(Array.isArray(next) ? next : []);
  };

  const rowConfig = useMemo(
    () => createRowConfig(recommendationData, recommendationSourceMovie),
    [recommendationData, recommendationSourceMovie]
  );

  const handleMyListClick = () => {
    if (!user?.$id) {
      requireLogin();
      return;
    }
    myListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setMyList([]);
    setRecommendationData([]);
  };

  return (
    <main className="min-h-screen bg-[#030014] text-white">
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        myListCount={myList.length}
        onMyListClick={handleMyListClick}
        user={user}
        onAvatarClick={requireLogin}
        onLogout={handleLogout}
      />
      <HeroBanner
        movie={featuredMovie}
        genresMap={genresMap}
        onPlayTrailer={setTrailerTarget}
        onMoreInfo={setSelectedMovie}
        onToggleMyList={toggleMyList}
        isInMyList={isInMyList(featuredMovie?.id)}
      />

      <section className="relative z-20 -mt-20 space-y-10 px-4 pb-16 md:px-8 lg:px-12">
        <MovieRecommendations
          user={user}
          onRecommendationsLoaded={(payload) => {
            setRecommendationSourceMovie(payload.inputMovie || '');
            setRecommendationData(Array.isArray(payload.recommendations) ? payload.recommendations : []);
          }}
        />

        <div ref={myListRef}>
          <ContentRow
            sectionId="my-list-row"
            title="My List"
            movies={myList}
            genresMap={genresMap}
            onPlayTrailer={setTrailerTarget}
            onMoreInfo={setSelectedMovie}
            onToggleMyList={toggleMyList}
            isInMyList={isInMyList}
            onRequireLogin={requireLogin}
            user={user}
          />
        </div>

        {rowConfig.map((row) => (
          <ContentRow
            key={row.key}
            title={row.title}
            movies={rows[row.key] || row.items || []}
            genresMap={genresMap}
            onPlayTrailer={setTrailerTarget}
            onMoreInfo={setSelectedMovie}
            onToggleMyList={toggleMyList}
            isInMyList={isInMyList}
            onRequireLogin={requireLogin}
            user={user}
          />
        ))}
      </section>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        results={searchResults}
        genresMap={genresMap}
        onPlayTrailer={setTrailerTarget}
        onMoreInfo={setSelectedMovie}
        onToggleMyList={toggleMyList}
        isInMyList={isInMyList}
        onRequireLogin={requireLogin}
        user={user}
      />

      <TrailerModal movie={trailerTarget} onClose={() => setTrailerTarget(null)} />

      <MovieDetails
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        genresMap={genresMap}
        posterBuilder={buildPoster}
        onPlayTrailer={setTrailerTarget}
        onToggleMyList={toggleMyList}
        isInMyList={selectedMovie ? isInMyList(selectedMovie.id) : false}
        onMoreInfo={setSelectedMovie}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={async (loggedInUser) => {
          setUser(loggedInUser);
          await refreshWishlist(loggedInUser);
        }}
      />
    </main>
  );
};

export default App;
