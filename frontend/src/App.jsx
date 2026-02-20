import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import MovieRecommendations from './components/MovieRecommendations.jsx'
import { API_CONFIG, TMDB_API_OPTIONS } from './config.js'

const PAGE_SIZE = 20

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [movieList, setMovieList] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [trendingMovies, setTrendingMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [page, setPage] = useState(1)

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 450, [searchTerm])

  const hasMore = useMemo(() => movieList.length >= page * PAGE_SIZE, [movieList.length, page])

  const buildMoviesEndpoint = useCallback(({ query, targetPage, genre, sort }) => {
    const params = new URLSearchParams({
      api_key: API_CONFIG.TMDB_API_KEY,
      page: String(targetPage),
    })

    if (query) {
      params.set('query', query)
      return `${API_CONFIG.TMDB_BASE_URL}/search/movie?${params.toString()}`
    }

    params.set('sort_by', sort)
    if (genre) params.set('with_genres', genre)

    return `${API_CONFIG.TMDB_BASE_URL}/discover/movie?${params.toString()}`
  }, [])

  const fetchMovies = useCallback(async ({ targetPage = 1, append = false } = {}) => {
    append ? setIsLoadingMore(true) : setIsLoading(true)
    setErrorMessage('')

    try {
      const endpoint = buildMoviesEndpoint({
        query: debouncedSearchTerm,
        targetPage,
        genre: selectedGenre,
        sort: sortBy,
      })

      const response = await fetch(endpoint, TMDB_API_OPTIONS)
      if (!response.ok) throw new Error('Failed to fetch movies')

      const data = await response.json()
      const nextResults = data.results || []
      setMovieList((current) => (append ? [...current, ...nextResults] : nextResults))
      setPage(targetPage)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setErrorMessage('Unable to fetch movies right now. Please try again.')
      if (!append) setMovieList([])
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false)
    }
  }, [buildMoviesEndpoint, debouncedSearchTerm, selectedGenre, sortBy])

  const loadTrendingMovies = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.TMDB_BASE_URL}/trending/movie/week?api_key=${API_CONFIG.TMDB_API_KEY}`,
        TMDB_API_OPTIONS,
      )
      if (!response.ok) throw new Error('Failed to fetch trending movies')
      const data = await response.json()
      setTrendingMovies(data.results || [])
    } catch (error) {
      console.error('Error fetching trending movies:', error)
    }
  }, [])

  const loadGenres = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.TMDB_BASE_URL}/genre/movie/list?api_key=${API_CONFIG.TMDB_API_KEY}`,
        TMDB_API_OPTIONS,
      )
      if (!response.ok) throw new Error('Failed to fetch genres')
      const data = await response.json()
      setGenres(data.genres || [])
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }, [])

  useEffect(() => {
    fetchMovies({ targetPage: 1, append: false })
  }, [fetchMovies])

  useEffect(() => {
    loadTrendingMovies()
    loadGenres()
  }, [loadGenres, loadTrendingMovies])

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="controls-panel glass-panel">
            <div className="control-group">
              <label htmlFor="genre-select">Genre</label>
              <select
                id="genre-select"
                value={selectedGenre}
                onChange={(event) => setSelectedGenre(event.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="sort-select">Sort</label>
              <select id="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Top Rated</option>
                <option value="release_date.desc">Newest</option>
              </select>
            </div>

            <button className="ghost-button" type="button" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          </div>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending glass-panel">
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
          <div className="section-header">
            <h2>All Movies</h2>
            <p>{movieList.length} titles loaded</p>
          </div>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-400">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>

              {hasMore && (
                <div className="load-more-wrap">
                  <button
                    type="button"
                    className="search-button"
                    disabled={isLoadingMore}
                    onClick={() => fetchMovies({ targetPage: page + 1, append: true })}
                  >
                    {isLoadingMore ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
