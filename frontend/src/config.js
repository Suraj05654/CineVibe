// API Configuration
export const API_CONFIG = {
  // Use environment variable for API URL, fallback to localhost for development
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  TMDB_BASE_URL: 'https://api.themoviedb.org/3'
}

// TMDB API options
export const TMDB_API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json'
  }
} 