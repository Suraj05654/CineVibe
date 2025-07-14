import os
from pathlib import Path
from dotenv import load_dotenv

# Always load .env from the backend directory, even if run from project root
dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path)

TMDB_API_KEY = os.getenv('VITE_TMDB_API_KEY')
if not TMDB_API_KEY or TMDB_API_KEY == "your_tmdb_api_key_here":
    print("ERROR: VITE_TMDB_API_KEY is not set or is still the placeholder!")
    print("Please set it in backend/.env as VITE_TMDB_API_KEY=your_real_tmdb_api_key")
    exit(1)

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from movie_recommender_class import MovieRecommendationSystem
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app)

TMDB_BASE_URL = 'https://api.themoviedb.org/3'

# Initialize the recommender system
recommender = MovieRecommendationSystem()

def load_recommender_model():
    """Load the pre-trained recommender model"""
    try:
        # Load the preprocessed data and similarity matrix
        with open('movie_list.pkl', 'rb') as f:
            final_df = pickle.load(f)
        with open('similarity.pkl', 'rb') as f:
            similarity_matrix = pickle.load(f)
        
        recommender.final_df = final_df
        recommender.similarity_matrix = similarity_matrix
        print("Recommender model loaded successfully")
        return True
    except FileNotFoundError:
        print("Model files not found. Please run the training script first.")
        return False

# Auto-build model files if missing
if not (os.path.exists('movie_list.pkl') and os.path.exists('similarity.pkl')):
    print("Model files not found. Generating them now...")
    recommender.load_data('movies.csv')
    recommender.preprocess_data()
    recommender.create_similarity_matrix()
    recommender.save_model()
    print("Model files generated.")


def get_movie_trailer_url(tmdb_id):
    """Fetch the first YouTube trailer URL for a movie from TMDB."""
    try:
        url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/videos"
        params = {
            'api_key': TMDB_API_KEY,
            'language': 'en-US'
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        for video in data.get('results', []):
            if video['site'] == 'YouTube' and video['type'] == 'Trailer':
                return f"https://www.youtube.com/watch?v={video['key']}"
        return None
    except Exception:
        return None

# Update get_movie_details_from_tmdb to include trailer_url

def get_movie_details_from_tmdb(movie_title, tmdb_id=None):
    """Get movie details from TMDB API, including trailer URL."""
    try:
        if tmdb_id:
            url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
            params = {
                'api_key': TMDB_API_KEY,
                'language': 'en-US'
            }
            response = requests.get(url, params=params)
            if response.status_code == 404:
                return None
            elif response.status_code != 200:
                return None
            movie = response.json()
        else:
            search_url = f"{TMDB_BASE_URL}/search/movie"
            params = {
                'api_key': TMDB_API_KEY,
                'query': movie_title,
                'language': 'en-US',
                'page': 1
            }
            response = requests.get(search_url, params=params)
            response.raise_for_status()
            data = response.json()
            if not data['results']:
                return None
            movie = data['results'][0]
        # Fetch trailer URL
        trailer_url = get_movie_trailer_url(movie['id'])
        return {
            'id': movie['id'],
            'title': movie['title'],
            'overview': movie['overview'],
            'poster_path': movie['poster_path'],
            'release_date': movie['release_date'],
            'vote_average': movie['vote_average'],
            'vote_count': movie['vote_count'],
            'trailer_url': trailer_url
        }
    except Exception as e:
        return None

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get movie recommendations based on a movie title"""
    try:
        data = request.get_json()
        movie_title = data.get('movie_title')
        num_recommendations = data.get('num_recommendations', 5)
        if not movie_title:
            return jsonify({'error': 'Movie title is required'}), 400
        # Get recommendations from our model
        if recommender.final_df is None or recommender.similarity_matrix is None:
            return jsonify({'error': 'Recommender model not loaded'}), 500
        # Find the movie in our dataset
        final_df = recommender.final_df
        if not isinstance(final_df, pd.DataFrame):
            final_df = pd.DataFrame(final_df)
        movie_matches = final_df[final_df['title'].str.contains(movie_title, case=False, na=False)]
        if movie_matches.empty:
            return jsonify({'error': f'Movie "{movie_title}" not found in our dataset'}), 404
        # Get the first match
        movie_index = movie_matches.index[0]
        movie_title_exact = final_df.iloc[movie_index]['title']
        # Get similar movies
        distances = sorted(list(enumerate(recommender.similarity_matrix[movie_index])), 
                         reverse=True, key=lambda x: x[1])
        # Get recommended movie titles
        recommended_movies = []
        found = 0
        attempts = 0
        max_attempts = 20  # Avoid infinite loops if many movies have no poster
        i = 1
        while found < num_recommendations and i < len(distances) and attempts < max_attempts:
            idx = distances[i][0]
            similarity_score = distances[i][1]
            row = final_df.iloc[idx]
            recommended_title = row['title']
            # Fetch details from TMDB
            movie_details = get_movie_details_from_tmdb(recommended_title)
            if movie_details and movie_details.get('poster_path'):
                movie_details['similarity_score'] = float(similarity_score)
                recommended_movies.append(movie_details)
                found += 1
            i += 1
            attempts += 1
        return jsonify({
            'input_movie': movie_title_exact,
            'recommendations': recommended_movies
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_movies():
    """Search for movies in our dataset"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        if recommender.final_df is None:
            return jsonify({'error': 'Recommender model not loaded'}), 500
        final_df = recommender.final_df
        if not isinstance(final_df, pd.DataFrame):
            final_df = pd.DataFrame(final_df)
        matches = final_df[final_df['title'].str.contains(query, case=False, na=False)]
        movie_titles = matches['title'].tolist()[:10]  # Limit to 10 results
        return jsonify({'movies': movie_titles})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trending', methods=['GET'])
def get_trending_movies():
    """Get trending movies from TMDB"""
    try:
        url = f"{TMDB_BASE_URL}/trending/movie/week"
        params = {
            'api_key': TMDB_API_KEY,
            'language': 'en-US'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        return jsonify({'movies': data['results'][:10]})  # Return top 10 trending movies
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    """Get detailed information about a specific movie"""
    try:
        url = f"{TMDB_BASE_URL}/movie/{movie_id}"
        params = {
            'api_key': TMDB_API_KEY,
            'language': 'en-US',
            'append_to_response': 'credits,videos,images'
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        return jsonify(response.json())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': recommender.final_df is not None})

if __name__ == '__main__':
    # Load the recommender model
    if load_recommender_model():
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to load recommender model. Please ensure the model files exist.") 