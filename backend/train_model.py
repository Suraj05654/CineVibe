#!/usr/bin/env python3
"""
Training script for the movie recommendation system.
This script loads the CSV datasets and generates the model files.
"""

import os
import sys
from movie_recommender_class import MovieRecommendationSystem

def main():
    """Train the movie recommendation model"""
    print("🎬 Starting Movie Recommendation Model Training")
    print("=" * 50)
    
    # Check if datasets exist
    movies_file = 'tmdb_5000_movies.csv'
    credits_file = 'tmdb_5000_credits.csv'
    
    if not os.path.exists(movies_file):
        print(f"❌ Error: {movies_file} not found!")
        sys.exit(1)
    
    if not os.path.exists(credits_file):
        print(f"❌ Error: {credits_file} not found!")
        sys.exit(1)
    
    try:
        # Initialize the recommender system
        print("📊 Initializing recommendation system...")
        recommender = MovieRecommendationSystem()
        
        # Load and process data
        print("📥 Loading datasets...")
        recommender.load_data(movies_file, credits_file)
        
        print("🔧 Preprocessing data...")
        recommender.preprocess_data()
        
        print("🧮 Creating similarity matrix...")
        recommender.create_similarity_matrix()
        
        # Save the model
        print("💾 Saving model files...")
        recommender.save_model()
        
        print("✅ Model training completed successfully!")
        print(f"📁 Generated files:")
        print(f"   - movie_list.pkl")
        print(f"   - similarity.pkl")
        
    except Exception as e:
        print(f"❌ Error during training: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 