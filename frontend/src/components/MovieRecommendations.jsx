import React, { useState } from 'react'
import MovieCard from './MovieCard.jsx'
import Spinner from './Spinner.jsx'
import { API_CONFIG } from '../config.js'

const MovieRecommendations = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputMovie, setInputMovie] = useState('')

  const getRecommendations = async (movieTitle) => {
    if (!movieTitle.trim()) {
      setError('Please enter a movie title')
      return
    }

    setIsLoading(true)
    setError('')
    setRecommendations([])

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

  return (
    <section className="recommendations">
      <h2>Get Movie Recommendations</h2>
      
      <form onSubmit={handleSubmit} className="recommendation-form">
        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a movie title..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={isLoading}>
            {isLoading ? 'Getting Recommendations...' : 'Get Recommendations'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {inputMovie && (
        <div className="input-movie">
          <h3>Recommendations for: <span className="highlight">{inputMovie}</span></h3>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <Spinner />
          <p>Finding similar movies...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="recommendations-grid">
          <ul>
            {recommendations.map((movie, index) => (
              <li key={movie.id || index}>
                <MovieCard movie={movie} />
                {movie.similarity_score && (
                  <div className="similarity-score">
                    <span>Similarity: {(movie.similarity_score * 100).toFixed(1)}%</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export default MovieRecommendations 