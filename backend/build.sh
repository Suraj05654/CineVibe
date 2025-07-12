#!/bin/bash

echo "🚀 Starting deployment build process..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Train the model
echo "🧠 Training movie recommendation model..."
python train_model.py

echo "✅ Build process completed!" 