import { useEffect, useMemo, useState } from 'react';
import { ID } from 'appwrite';
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
import { account } from './services/appwrite';
import {
  addToWatchlist,
  fetchUserWatchlist,
  removeFromWatchlist,
  verifyWishlistCollectionAccess
} from './services/wishlist';

const API_BASE = API_CONFIG.TMDB_BASE_URL;
const API_KEY = API_CONFIG.TMDB_API_KEY;

const buildPoster = (path, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '/no-movie.png';

const createRowConfig = (recommendationData, recommendationSourceMovie, myList) => [
  { key: 'trending', title: 'Trending Now', endpoint: `${API_BASE}/trending/movie/week?api_key=${API_KEY}` },
  { key: 'topRated', title: 'Top Rated', endpoint: `${API_BASE}/movie/top_rated?api_key=${API_KEY}` },
  {
    key: 'becauseYouWatched',
    title: recommendationSourceMovie ? `Because You Watched ${recommendationSourceMovie}` : 'Because You Watched',
    items: recommendationData
  },
  { key: 'india', title: 'Popular in India', endpoint: `${API_BASE}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&watch_region=IN&region=IN` },
  { key: 'new', title: 'New Releases', endpoint: `${API_BASE}/discover/movie?api_key=${API_KEY}&sort_by=release_date.desc&primary_release_date.lte=${new Date().toISOString().split('T')[0]}` },
  { key: 'myList', title: 'My List', items: myList }
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [recommendationRefreshSignal, setRecommendationRefreshSignal] = useState(0);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 450, [searchTerm]);

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthModalOpen(true);
  };

  const showUiError = (message) => {
    setAuthError(message);
    if (!authModalOpen) {
      window.alert(message);
    }
  };

  const verifySession = async () => {
    try {
      const current = await account.get();
      console.log('SESSION EXISTS', current);
      setUser(current);
      return current;
    } catch (error) {
      console.log('NO SESSION');
      console.error(error);
      setUser(null);
      setMyList([]);
      return null;
    }
  };

  const fetchUserWishlist = async (userId) => {
    if (!userId) {
      console.log('FETCH WISHLIST STOPPED: NO USER');
      setMyList([]);
      return;
    }

    try {
      const items = await fetchUserWatchlist(userId);
      setMyList(items || []);
    } catch (error) {
      console.error('WISHLIST FETCH FAILED', error);
      showUiError(error?.message || 'Failed to fetch wishlist.');
      throw error;
    }
  };

  const verifyWishlistDatabase = async (userId) => {
    try {
      await verifyWishlistCollectionAccess(userId);
    } catch (error) {
      console.error('WISHLIST DATABASE VERIFICATION FAILED', error);
      showUiError(error?.message || 'Wishlist permissions are invalid.');
      throw error;
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const current = await verifySession();
      if (!current) {
        return;
      }

      await verifyWishlistDatabase(current.$id);
      await fetchUserWishlist(current.$id);
    };

    bootstrapAuth().catch((error) => {
      console.error('BOOTSTRAP AUTH FAILED', error);
    });
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const genreRes = await fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}`, TMDB_API_OPTIONS);
      const genreData = await genreRes.json();
      const map = Object.fromEntries((genreData.genres || []).map((genre) => [genre.id, genre.name]));
      setGenresMap(map);

      const rowConfig = createRowConfig(recommendationData, recommendationSourceMovie, myList);
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
  }, [recommendationData, recommendationSourceMovie, myList, user]);

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

  const requireAuth = async () => {
    const current = await verifySession();
    if (!current) {
      openAuthModal('login');
      return null;
    }

    try {
      await verifyWishlistDatabase(current.$id);
      return current;
    } catch (error) {
      console.error('AUTH REQUIREMENT FAILED', error);
      return null;
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    const existingItem = myList.find((item) => item.id === movieId);
    if (!existingItem) return;

    try {
      await removeFromWatchlist(existingItem.documentId);
      setMyList((prev) => prev.filter((item) => item.id !== movieId));
    } catch (error) {
      console.error('Failed removing from wishlist', error);
      showUiError(error?.message || 'Failed removing from wishlist.');
      throw error;
    }
  };

  const handleAddToWatchlist = async (movie, sessionUser) => {
    try {
      const persistedMovie = await addToWatchlist(sessionUser.$id, movie);
      setMyList((prev) => [persistedMovie, ...prev.filter((item) => item.id !== persistedMovie.id)]);
    } catch (error) {
      console.error('Failed adding to wishlist', error);
      showUiError(error?.message || 'Failed adding to wishlist.');
      throw error;
    }
  };

  const toggleMyList = async (movie) => {
    const sessionUser = await requireAuth();
    if (!sessionUser) {
      console.log('WISHLIST ACTION STOPPED: NO SESSION');
      return;
    }

    const movieId = Number(movie.id);
    if (myList.some((item) => item.id === movieId)) {
      await handleRemoveFromWatchlist(movieId);
      return;
    }

    await handleAddToWatchlist(movie, sessionUser);
  };

  const handleLogin = async (email, password) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      console.log('LOGIN SESSION CREATED');
      const current = await account.get();
      console.log('SESSION EXISTS', current);
      setUser(current);
      await verifyWishlistDatabase(current.$id);
      await fetchUserWishlist(current.$id);
      setRecommendationRefreshSignal((value) => value + 1);
      setAuthModalOpen(false);
    } catch (error) {
      console.error(error);
      setAuthError(error?.message || 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (name, email, password) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await account.create(ID.unique(), email, password, name);
      console.log('USER CREATED');
      await account.createEmailPasswordSession(email, password);
      console.log('SESSION CREATED AFTER SIGNUP');
      const current = await account.get();
      console.log('SESSION EXISTS', current);
      setUser(current);
      await verifyWishlistDatabase(current.$id);
      await fetchUserWishlist(current.$id);
      setRecommendationRefreshSignal((value) => value + 1);
      setAuthModalOpen(false);
    } catch (error) {
      console.error(error);
      setAuthError(error?.message || 'Sign up failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Failed to logout cleanly', error);
    } finally {
      setUser(null);
      setMyList([]);
      setRecommendationData([]);
      setRecommendationSourceMovie('');
    }
  };

  const rowConfig = useMemo(
    () => createRowConfig(recommendationData, recommendationSourceMovie, myList),
    [recommendationData, recommendationSourceMovie, myList]
  );

  const handleMyListClick = async () => {
    const sessionUser = await requireAuth();
    if (!sessionUser) return;
    document.getElementById('my-list-row')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBrowseClick = () => {
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-[#030014] text-white">
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        myListCount={myList.length}
        onMyListClick={handleMyListClick}
        onAuthAction={() => openAuthModal('login')}
        onBrowseClick={handleBrowseClick}
        user={user}
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

      <section className="relative z-20 mt-10 space-y-10 px-4 pb-16 md:px-8 lg:px-12">
        <MovieRecommendations
          userId={user?.$id ?? 'guest'}
          refreshSignal={recommendationRefreshSignal}
          onRecommendationsLoaded={(payload) => {
            setRecommendationSourceMovie(payload.inputMovie || '');
            setRecommendationData(payload.recommendations || []);
          }}
        />

        {rowConfig.map((row) => (
          <div key={row.key} id={row.key === 'myList' ? 'my-list-row' : undefined}>
            <ContentRow
              title={row.title}
              movies={rows[row.key] || row.items || []}
              genresMap={genresMap}
              onPlayTrailer={setTrailerTarget}
              onMoreInfo={setSelectedMovie}
              onToggleMyList={toggleMyList}
              isInMyList={isInMyList}
            />
          </div>
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
        isOpen={authModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        loading={authLoading}
        error={authError}
      />
    </main>
  );
};

export default App;
