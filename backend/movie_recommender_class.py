import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

class MovieRecommendationSystem:
    def __init__(self):
        self.movies_df = None
        self.similarity_matrix = None
        self.final_df = None
        
    def load_data(self, movies_path):
        """Load the movie dataset (Movies.csv)"""
        print("Loading dataset...")
        movies = pd.read_csv(movies_path)
        # Only keep relevant columns
        movies = movies[['title', 'overview']]
        if not isinstance(movies, pd.DataFrame):
            movies = pd.DataFrame(movies)
        movies.dropna(subset=['title'], inplace=True)
        self.movies_df = movies
        print(f"Loaded {len(movies)} movies")

    def preprocess_data(self):
        """Preprocess the movie dataset for recommendations"""
        if self.movies_df is None:
            raise ValueError("Data not loaded. Call load_data() before preprocess_data().")
        if not isinstance(self.movies_df, pd.DataFrame):
            self.movies_df = pd.DataFrame(self.movies_df)
        print("Preprocessing data...")
        # Build tags from title and overview
        self.movies_df['tags'] = (
            self.movies_df['title'].fillna('') + ' ' +
            self.movies_df['overview'].fillna('')
        )
        self.final_df = self.movies_df[['title', 'tags']].copy()
        print("Preprocessing completed")

    def create_similarity_matrix(self, max_features=5000):
        """Create similarity matrix"""
        if self.final_df is None:
            raise ValueError("Data not preprocessed. Call preprocess_data() before create_similarity_matrix().")
        if not isinstance(self.final_df, pd.DataFrame):
            self.final_df = pd.DataFrame(self.final_df)
        print("Creating similarity matrix...")
        vectorizer = CountVectorizer(max_features=max_features, stop_words='english')
        vectors = vectorizer.fit_transform(self.final_df['tags'])
        if isinstance(vectors, tuple):
            vectors = vectors[0]
        vectors = vectors.toarray()
        self.similarity_matrix = cosine_similarity(vectors)
        print(f"Similarity matrix created with shape: {self.similarity_matrix.shape}")

    def recommend_movies(self, movie_title, num_recommendations=5):
        """Recommend movies based on similarity"""
        if self.final_df is None or self.similarity_matrix is None:
            raise ValueError("Model not ready. Ensure data is preprocessed and similarity matrix is created.")
        if not isinstance(self.final_df, pd.DataFrame):
            self.final_df = pd.DataFrame(self.final_df)
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
        if not isinstance(self.final_df, pd.DataFrame):
            self.final_df = pd.DataFrame(self.final_df)
        matches = self.final_df[self.final_df['title'].str.contains(query, case=False, na=False)]
        return matches['title'].tolist()

    def save_model(self, movies_file='movie_list.pkl', similarity_file='similarity.pkl'):
        """Save the model"""
        print("Saving model...")
        pickle.dump(self.final_df, open(movies_file, 'wb'))
        pickle.dump(self.similarity_matrix, open(similarity_file, 'wb'))
        print("Model saved successfully") 