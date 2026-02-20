import { useEffect, useState } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import TrailerModal from './components/TrailerModal.jsx'
import MovieDetailsModal from './components/MovieDetailsModal.jsx'
import MovieRecommendations from './components/MovieRecommendations.jsx'
import { useDebounce } from 'react-use'
import { API_CONFIG, TMDB_API_OPTIONS } from './config.js'

const API_BASE_URL = API_CONFIG.TMDB_BASE_URL;
const API_KEY = API_CONFIG.TMDB_API_KEY;
const API_OPTIONS = TMDB_API_OPTIONS;
const SECTION_CONFIG = [
  { key: 'trending', label: 'Trending This Week', endpoint: '/trending/movie/week' },
  { key: 'popular', label: 'Popular on CineVibe', endpoint: '/movie/popular' },
  { key: 'topRated', label: 'Top Rated', endpoint: '/movie/top_rated' },
  { key: 'nowPlaying', label: 'Now Playing', endpoint: '/movie/now_playing' },
  { key: 'upcoming', label: 'Upcoming', endpoint: '/movie/upcoming' },
]

const sortOptions = [
  { value: 'popularity.desc', label: 'Popularity ↓' },
  { value: 'vote_average.desc', label: 'Rating ↓' },
  { value: 'primary_release_date.desc', label: 'Newest ↓' },
  { value: 'revenue.desc', label: 'Revenue ↓' },
]

const initialDiscoverFilters = {
  genre: '',
  sortBy: 'popularity.desc',
  year: '',
  rating: '0',
  language: '',
  region: '',
  includeAdult: false,
}

const App = () => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState({})
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [genres, setGenres] = useState([])
  const [discoverFilters, setDiscoverFilters] = useState(initialDiscoverFilters)
  const [discoverMovies, setDiscoverMovies] = useState([])

    const [trendingMovies, setTrendingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [trailerUrl, setTrailerUrl] = useState(null)

    // Debounce the search term to prevent making too many API requests
    // by waiting for the user to stop typing for 500ms
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])
  const [loading, setLoading] = useState(true)
  const [discoverLoading, setDiscoverLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
  useDebounce(() => setDebouncedSearchTerm(searchTerm.trim()), 450, [searchTerm])

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
  const apiBase = API_CONFIG.TMDB_BASE_URL
  const apiKey = API_CONFIG.TMDB_API_KEY

            const response = await fetch(endpoint, API_OPTIONS);
  const buildUrl = useCallback(
    (path, params = {}) => {
      const search = new URLSearchParams({ api_key: apiKey, ...params })
      return `${apiBase}${path}?${search.toString()}`
    },
    [apiBase, apiKey],
  )

            if(!response.ok) {
                throw new Error('Failed to fetch movies');
            }
  const fetchJson = useCallback(
    async (path, params = {}) => {
      const response = await fetch(buildUrl(path, params), TMDB_API_OPTIONS)
      if (!response.ok) throw new Error(`TMDB request failed: ${path}`)
      return response.json()
    },
    [buildUrl],
  )

            const data = await response.json();
  const fetchHomeSections = useCallback(async () => {
    if (!apiKey) {
      setErrorMessage('TMDB API key is missing. Add VITE_TMDB_API_KEY in frontend/.env')
      return
    }

    setLoading(true)
    setErrorMessage('')

            if(data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                return;
            }
    try {
      const [genreData, ...sectionData] = await Promise.all([
        fetchJson('/genre/movie/list'),
        ...SECTION_CONFIG.map((section) => fetchJson(section.endpoint)),
      ])

            setMovieList(data.results || []);
      setGenres(genreData.genres || [])

      const nextSections = SECTION_CONFIG.reduce((acc, section, index) => {
        acc[section.key] = sectionData[index]?.results?.slice(0, 16) || []
        return acc
      }, {})

        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
      setSections(nextSections)
      setFeaturedMovie(nextSections.trending?.[0] || nextSections.popular?.[0] || null)
    } catch (error) {
      console.error(error)
      setErrorMessage('Unable to load TMDB content right now. Please try again soon.')
    } finally {
      setLoading(false)
    }
  }, [apiKey, fetchJson])

  const fetchDiscoverMovies = useCallback(async () => {
    if (!apiKey) return
    setDiscoverLoading(true)

    try {
      const params = {
        sort_by: discoverFilters.sortBy,
        with_genres: discoverFilters.genre || undefined,
        primary_release_year: discoverFilters.year || undefined,
        'vote_average.gte': discoverFilters.rating,
        with_original_language: discoverFilters.language || undefined,
        region: discoverFilters.region || undefined,
        include_adult: discoverFilters.includeAdult,
      }

    const loadTrendingMovies = async () => {
        try {
            const response = await fetch(`${API_CONFIG.TMDB_BASE_URL}/trending/movie/week?api_key=${API_CONFIG.TMDB_API_KEY}`, TMDB_API_OPTIONS);
            const data = await response.json();
            setTrendingMovies(data.results || []);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
      const queryPath = debouncedSearchTerm ? '/search/movie' : '/discover/movie'
      const queryParams = debouncedSearchTerm
        ? { query: debouncedSearchTerm, include_adult: discoverFilters.includeAdult }
        : params

      const data = await fetchJson(queryPath, queryParams)
      setDiscoverMovies(data.results || [])
    } catch (error) {
      console.error(error)
      setDiscoverMovies([])
    } finally {
      setDiscoverLoading(false)
    }
  }, [apiKey, debouncedSearchTerm, discoverFilters, fetchJson])

  const openMovieDetails = useCallback(
    async (movieId) => {
      try {
        const details = await fetchJson(`/movie/${movieId}`, {
          append_to_response: 'videos,credits,similar',
        })
        setSelectedMovie(details)
      } catch (error) {
        console.error(error)
      }
    },
    [fetchJson],
  )

  const playTrailer = useCallback(
    async (movieId) => {
      try {
        const data = await fetchJson(`/movie/${movieId}/videos`)
        const trailer = (data.results || []).find(
          (video) => video.site === 'YouTube' && ['Trailer', 'Teaser'].includes(video.type),
        )
        if (trailer) setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`)
      } catch (error) {
        console.error(error)
      }
    },
    [fetchJson],
  )

  useEffect(() => {
    fetchHomeSections()
  }, [fetchHomeSections])

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.id}>
                                    <p>{index + 1}</p>
                                    <img
                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-movie.png'}
                                        alt={movie.title}
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <MovieRecommendations />

                <section className="all-movies">
                    <h2>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
  useEffect(() => {
    fetchDiscoverMovies()
  }, [fetchDiscoverMovies])

  const heroBackdrop = useMemo(() => {
    if (!featuredMovie?.backdrop_path) return ''
    return `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`
  }, [featuredMovie])

  return (
    <main className="app-shell" style={heroBackdrop ? { backgroundImage: `url(${heroBackdrop})` } : undefined}>
      <div className="wrapper">
        <header className="hero" style={heroBackdrop ? { backgroundImage: `url(${heroBackdrop})` } : undefined}>
          <div className="hero-mask" />
          <nav className="top-nav">
            <div className="brand">
              <img src="/logo.png" alt="CineVibe logo" />
              <span>CineVibe</span>
            </div>
        </main>
    )
          </nav>

          <div className="hero-content">
            <p className="eyebrow">Curated movie intelligence</p>
            <h1>Discover Exceptional Films with Confidence</h1>
            <p>
              Explore trusted TMDB data with powerful filters, detailed insights, and high-quality trailer playback in
              one professional experience.
            </p>
            {featuredMovie && (
              <div className="hero-actions">
                <button className="primary-btn" type="button" onClick={() => playTrailer(featuredMovie.id)}>
                  ▶ Watch Featured Trailer
                </button>
                <button className="secondary-btn" type="button" onClick={() => openMovieDetails(featuredMovie.id)}>
                  More Info
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="discover-panel">
          <div className="discover-header">
            <h2>Explore TMDB</h2>
            <p>{discoverMovies.length} results</p>
          </div>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="filters-grid">
            <select value={discoverFilters.genre} onChange={(e) => setDiscoverFilters((prev) => ({ ...prev, genre: e.target.value }))}>
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>

            <select value={discoverFilters.sortBy} onChange={(e) => setDiscoverFilters((prev) => ({ ...prev, sortBy: e.target.value }))}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Year"
              min="1900"
              max="2100"
              value={discoverFilters.year}
              onChange={(e) => setDiscoverFilters((prev) => ({ ...prev, year: e.target.value }))}
            />

            <input
              type="number"
              placeholder="Min rating (0-10)"
              min="0"
              max="10"
              step="0.5"
              value={discoverFilters.rating}
              onChange={(e) => setDiscoverFilters((prev) => ({ ...prev, rating: e.target.value }))}
            />

            <input
              type="text"
              placeholder="Language (en)"
              maxLength="2"
              value={discoverFilters.language}
              onChange={(e) => setDiscoverFilters((prev) => ({ ...prev, language: e.target.value.toLowerCase() }))}
            />

            <input
              type="text"
              placeholder="Region (US)"
              maxLength="2"
              value={discoverFilters.region}
              onChange={(e) => setDiscoverFilters((prev) => ({ ...prev, region: e.target.value.toUpperCase() }))}
            />
          </div>

          <label className="adult-toggle">
            <input
              type="checkbox"
              checked={discoverFilters.includeAdult}
              onChange={(e) => setDiscoverFilters((prev) => ({ ...prev, includeAdult: e.target.checked }))}
            />
            Include adult content
          </label>

          {discoverLoading ? (
            <Spinner />
          ) : (
            <div className="discover-grid">
              {discoverMovies.slice(0, 20).map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlayTrailer={playTrailer}
                  onOpenDetails={openMovieDetails}
                />
              ))}
            </div>
          )}
        </section>

        <section className="recommendations-wrap">
          <MovieRecommendations />
        </section>

        {SECTION_CONFIG.map((section) => (
          <section key={section.key} className="rail-section">
            <h2>{section.label}</h2>
            <div className="rail-row">
              {(sections[section.key] || []).map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  compact
                  onPlayTrailer={playTrailer}
                  onOpenDetails={openMovieDetails}
                />
              ))}
            </div>
          </section>
        ))}


        {loading && <Spinner />}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </div>

      <TrailerModal trailerUrl={trailerUrl} onClose={() => setTrailerUrl(null)} />
      <MovieDetailsModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onPlayTrailer={() => {
          if (!selectedMovie) return
          playTrailer(selectedMovie.id)
        }}
      />
    </main>
  )
}

export default App
export default App