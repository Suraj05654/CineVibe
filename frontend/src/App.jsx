import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import TrailerModal from './components/TrailerModal.jsx'
import MovieDetailsModal from './components/MovieDetailsModal.jsx'
import MovieRecommendations from './components/MovieRecommendations.jsx'
import { API_CONFIG, TMDB_API_OPTIONS } from './config.js'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const [sections, setSections] = useState({})
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [genres, setGenres] = useState([])
  const [discoverFilters, setDiscoverFilters] = useState(initialDiscoverFilters)
  const [discoverMovies, setDiscoverMovies] = useState([])

  const [selectedMovie, setSelectedMovie] = useState(null)
  const [trailerUrl, setTrailerUrl] = useState(null)

  const [loading, setLoading] = useState(true)
  const [discoverLoading, setDiscoverLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useDebounce(() => setDebouncedSearchTerm(searchTerm.trim()), 450, [searchTerm])

  const apiBase = API_CONFIG.TMDB_BASE_URL
  const apiKey = API_CONFIG.TMDB_API_KEY

  const buildUrl = useCallback(
    (path, params = {}) => {
      const search = new URLSearchParams({ api_key: apiKey, ...params })
      return `${apiBase}${path}?${search.toString()}`
    },
    [apiBase, apiKey],
  )

  const fetchJson = useCallback(
    async (path, params = {}) => {
      const response = await fetch(buildUrl(path, params), TMDB_API_OPTIONS)
      if (!response.ok) throw new Error(`TMDB request failed: ${path}`)
      return response.json()
    },
    [buildUrl],
  )

  const fetchHomeSections = useCallback(async () => {
    if (!apiKey) {
      setErrorMessage('TMDB API key is missing. Add VITE_TMDB_API_KEY in frontend/.env')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const [genreData, ...sectionData] = await Promise.all([
        fetchJson('/genre/movie/list'),
        ...SECTION_CONFIG.map((section) => fetchJson(section.endpoint)),
      ])

      setGenres(genreData.genres || [])

      const nextSections = SECTION_CONFIG.reduce((acc, section, index) => {
        acc[section.key] = sectionData[index]?.results?.slice(0, 16) || []
        return acc
      }, {})

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
