import React, { useState, useEffect, useRef } from 'react'
import MovieCard from './MovieCard.jsx'
import Spinner from './Spinner.jsx'
import { API_CONFIG } from '../config.js'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieRecommendations = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputMovie, setInputMovie] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const controller = new AbortController();
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setSuggestions(data.results.slice(0, 6));
        setShowSuggestions(true);
      } catch (e) {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }
    fetchSuggestions();
    return () => controller.abort();
  }, [searchTerm])

  const getRecommendations = async (movieTitle) => {
    if (!movieTitle.trim()) {
      setError('Please enter a movie title')
      return
    }
    setIsLoading(true)
    setError('')
    setRecommendations([])
    setShowSuggestions(false)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_title: movieTitle,
          num_recommendations: 4
        })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get recommendations')
      }
      const data = await response.json()
      setRecommendations(data.recommendations)
      setInputMovie(data.input_movie)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    getRecommendations(searchTerm)
  }

  const handleSuggestionClick = (title) => {
    setSearchTerm(title)
    setShowSuggestions(false)
    getRecommendations(title)
    if (inputRef.current) inputRef.current.blur();
  }

  return (
    <section className="recommendations flex flex-col items-center mt-8">
      <h2 className="text-center w-full">Get Movie Recommendations</h2>
      <form onSubmit={handleSubmit} className="recommendation-form flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl mx-auto">
        <div className="search-container relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a movie title..."
            className="search-input"
            autoComplete="off"
            ref={inputRef}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          />
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 bg-[#232044] border border-[#AB8BFF] rounded-lg mt-1 shadow-lg max-h-72 overflow-y-auto">
              {suggestions.map(s => (
                <li
                  key={s.id}
                  className="px-4 py-2 cursor-pointer hover:bg-[#AB8BFF]/20 text-white text-left"
                  onMouseDown={() => handleSuggestionClick(s.title)}
                >
                  <div className="flex items-center gap-2">
                    {s.poster_path && <img src={`https://image.tmdb.org/t/p/w92${s.poster_path}`} alt={s.title} className="w-8 h-12 object-cover rounded" />}
                    <span>{s.title} {s.release_date ? <span className="text-xs text-gray-400 ml-2">({s.release_date.split('-')[0]})</span> : null}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {inputMovie && (
        <div className="w-full flex justify-center mt-8 mb-2">
          <h3 className="input-movie text-center max-w-2xl text-lg font-semibold text-white/90">
            Recommendations for: <span className="highlight">{inputMovie}</span>
          </h3>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <Spinner />
          <p>Finding similar movies...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-grid grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full justify-center mb-12">
          {recommendations.map((movie, index) => (
            <div key={movie.id || index} className="relative h-full flex">
              <MovieCard movie={movie} />
              {movie.similarity_score && (
                <div className="similarity-score">
                  <span>Similarity: {(movie.similarity_score * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default MovieRecommendations 