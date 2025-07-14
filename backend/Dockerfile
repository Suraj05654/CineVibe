# Use official Python 3.11 image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port (default Flask/Gunicorn port)
EXPOSE 5000

# Run the model training script (if model files are missing)
RUN if [ ! -f "movie_list.pkl" ] || [ ! -f "similarity.pkl" ]; then python train_model.py; fi

# Start the app with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"] 