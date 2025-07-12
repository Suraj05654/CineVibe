import numpy as np
import pandas as pd
import ast
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

class MovieRecommendationSystem:
    def __init__(self):
        self.movies_df = None
        self.similarity_matrix = None
        self.final_df = None
        
    def load_data(self, movies_path, credits_path):
        """Load and merge the movie and credits datasets"""
        print("Loading datasets...")
        movies = pd.read_csv(movies_path)
        credits = pd.read_csv(credits_path)
        
        movies = movies.merge(credits, on='title')
        movies = movies[['movie_id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew']]
        movies.dropna(inplace=True)
        
        self.movies_df = movies
        print(f"Loaded {len(movies)} movies")
        
    def convert_json_to_list(self, text):
        """Convert JSON string to list of names"""
        try:
            L = []
            for i in ast.literal_eval(text):
                L.append(i['name'])
            return L
        except:
            return []
    
    def get_cast_names(self, text, limit=3):
        """Extract cast names (limited to top 3)"""
        try:
            L = []
            counter = 0
            for i in ast.literal_eval(text):
                if counter < limit:
                    L.append(i['name'])
                    counter += 1
            return L
        except:
            return []
    
    def get_director(self, text):
        """Extract director name from crew"""
        try:
            L = []
            for i in ast.literal_eval(text):
                if i['job'] == 'Director':
                    L.append(i['name'])
            return L
        except:
            return []
    
    def remove_spaces(self, L):
        """Remove spaces from names"""
        return [i.replace(" ", "") for i in L]
    
    def preprocess_data(self):
        """Preprocess all the text data"""
        if self.movies_df is None:
            raise ValueError("Data not loaded. Call load_data() before preprocess_data().")
        print("Preprocessing data...")
        
        self.movies_df['genres'] = self.movies_df['genres'].apply(self.convert_json_to_list)
        self.movies_df['keywords'] = self.movies_df['keywords'].apply(self.convert_json_to_list)
        self.movies_df['cast'] = self.movies_df['cast'].apply(self.get_cast_names)
        self.movies_df['crew'] = self.movies_df['crew'].apply(self.get_director)
        
        for col in ['cast', 'crew', 'genres', 'keywords']:
            self.movies_df[col] = self.movies_df[col].apply(self.remove_spaces)
        
        self.movies_df['overview'] = self.movies_df['overview'].apply(lambda x: x.split())
        
        self.movies_df['tags'] = (
            self.movies_df['overview'] +
            self.movies_df['genres'] +
            self.movies_df['keywords'] +
            self.movies_df['cast'] +
            self.movies_df['crew']
        )
        self.movies_df['tags'] = self.movies_df['tags'].apply(lambda x: " ".join(x))
        self.final_df = self.movies_df[['movie_id', 'title', 'tags']].copy()
        
        print("Preprocessing completed")
    
    def create_similarity_matrix(self, max_features=5000):
        """Create similarity matrix"""
        if self.final_df is None:
            raise ValueError("Data not preprocessed. Call preprocess_data() before create_similarity_matrix().")
        print("Creating similarity matrix...")
        
        vectorizer = CountVectorizer(max_features=max_features, stop_words='english')
        vectors = vectorizer.fit_transform(self.final_df['tags']).toarray()
        self.similarity_matrix = cosine_similarity(vectors)
        
        print(f"Similarity matrix created with shape: {self.similarity_matrix.shape}")
    
    def recommend_movies(self, movie_title, num_recommendations=5):
        """Recommend movies based on similarity"""
        if self.final_df is None or self.similarity_matrix is None:
            raise ValueError("Model not ready. Ensure data is preprocessed and similarity matrix is created.")
        try:
            movie_index = self.final_df[self.final_df['title'] == movie_title].index[0]
            distances = sorted(list(enumerate(self.similarity_matrix[movie_index])), 
                              reverse=True, key=lambda x: x[1])
            
            print(f"\nMovies similar to '{movie_title}':")
            print("-" * 40)
            
            for i in distances[1:num_recommendations+1]:
                movie_name = self.final_df.iloc[i[0]].title
                similarity_score = i[1]
                print(f"{movie_name} (Similarity: {similarity_score:.3f})")
                
        except IndexError:
            print(f"Movie '{movie_title}' not found in dataset")
    
    def search_movies(self, query):
        """Search for movies by title"""
        if self.final_df is None:
            raise ValueError("Data not preprocessed. Call preprocess_data() before search_movies().")
        matches = self.final_df[self.final_df['title'].str.contains(query, case=False, na=False)]
        return matches['title'].tolist()
    
    def save_model(self, movies_file='movie_list.pkl', similarity_file='similarity.pkl'):
        """Save the model"""
        print("Saving model...")
        pickle.dump(self.final_df, open(movies_file, 'wb'))
        pickle.dump(self.similarity_matrix, open(similarity_file, 'wb'))
        print("Model saved successfully")

# Usage example
if __name__ == "__main__":
    # Initialize the system
    recommender = MovieRecommendationSystem()
    
    # Load and process data
    recommender.load_data('tmdb_5000_movies.csv', 'tmdb_5000_credits.csv')
    recommender.preprocess_data()
    recommender.create_similarity_matrix()
    
    # Save the model
    recommender.save_model()
    
    # Example usage
    print("\n" + "="*50)
    print("MOVIE RECOMMENDATION SYSTEM")
    print("="*50)
    
    # Search functionality
    print("\nSearching for movies with 'batman':")
    batman_movies = recommender.search_movies('batman')
    print(batman_movies[:5])
    
    # Get recommendations
    print("\nGetting recommendations...")
    while True:
        user_movie = input("\nEnter a movie title for recommendations (or 'exit' to quit): ")
        if user_movie.lower() == 'exit':
            print("Exiting recommendation system. Goodbye!")
            break
        recommender.recommend_movies(user_movie, 5)
    print("\nSystem ready!") 