import React from 'react'

const getYear = (date) => (date ? date.split('-')[0] : 'N/A')

export default function MovieDetailsModal({ movie, onClose, onPlayTrailer }) {
  if (!movie) return null

  const cast = (movie.credits?.cast || []).slice(0, 8)
  const similar = (movie.similar?.results || []).slice(0, 6)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="details-modal" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        {movie.backdrop_path && (
          <div
            className="details-backdrop"
            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
          />
        )}

        <div className="details-content">
          <h3>{movie.title}</h3>
          <p className="details-meta">
            {getYear(movie.release_date)} • {movie.runtime ? `${movie.runtime} min` : 'Runtime N/A'} • ⭐{' '}
            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </p>

          <div className="details-tags">
            {(movie.genres || []).map((genre) => (
              <span key={genre.id}>{genre.name}</span>
            ))}
          </div>

          <p className="details-overview">{movie.overview || 'No overview available.'}</p>

          <div className="details-actions">
            <button type="button" className="primary-btn" onClick={onPlayTrailer}>
              Play Trailer
            </button>
            <a
              className="ghost-link"
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Open movie page
            </a>
          </div>

          {cast.length > 0 && (
            <div>
              <h4>Top Cast</h4>
              <div className="cast-list">
                {cast.map((person) => (
                  <div key={person.cast_id || person.credit_id} className="cast-item">
                    <p>{person.name}</p>
                    <span>{person.character}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <h4>Similar Titles</h4>
              <div className="similar-grid">
                {similar.map((item) => (
                  <div key={item.id} className="similar-item">
                    {item.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={item.title} />
                    ) : (
                      <div className="empty-poster">No Poster</div>
                    )}
                    <p>{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
