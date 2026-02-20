import React from 'react'

const posterUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w500${path.startsWith('/') ? path : `/${path}`}` : '/no-movie.png'

export default function MovieCard({ movie, onPlayTrailer, onOpenDetails, compact = false }) {
  return (
    <article className={`movie-card ${compact ? 'movie-card-compact' : ''}`}>
      <button className="poster-btn" type="button" onClick={() => onOpenDetails?.(movie.id)}>
        <img src={posterUrl(movie.poster_path)} alt={movie.title} className="poster" />
      </button>

      <div className="movie-info">
        <h3 title={movie.title}>{movie.title}</h3>
        <p>
          ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} • {movie.original_language?.toUpperCase() || 'N/A'} •{' '}
          {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
        </p>
      </div>

      <div className="movie-actions">
        <button className="primary-btn" type="button" onClick={() => onPlayTrailer?.(movie.id)}>
          Play Trailer
        </button>
        <button className="secondary-btn" type="button" onClick={() => onOpenDetails?.(movie.id)}>
          Details
        </button>
      </div>
    </article>
  )
}
