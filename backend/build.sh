#!/bin/bash

echo "🚀 Starting build process..."

# Check Python version
echo "🐍 Python version:"
python --version

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing requirements..."
pip install -r requirements.txt

# Check if model files exist, if not train the model
if [ ! -f "movie_list.pkl" ] || [ ! -f "similarity.pkl" ]; then
    echo "🎬 Training movie recommendation model..."
    python train_model.py
else
    echo "✅ Model files already exist, skipping training"
fi

echo "✅ Build completed successfully!" 