# 🚀 Deployment Guide

## Render Deployment (Backend)

### 1. Connect to Render
- Go to [Render Dashboard](https://dashboard.render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repository

### 2. Configure the Service
- **Name**: `movie-recommender-backend`
- **Environment**: `Python`
- **Build Command**: 
  ```bash
  cd backend
  pip install -r requirements.txt
  python train_model.py
  ```
- **Start Command**:
  ```bash
  cd backend
  gunicorn app:app --bind 0.0.0.0:$PORT
  ```

### 3. Environment Variables
Add these in Render dashboard:
- `VITE_TMDB_API_KEY`: Your TMDB API key

### 4. Deploy
- Click "Create Web Service"
- Wait for build to complete (5-10 minutes)
- Copy the generated URL

## Vercel Deployment (Frontend)

### 1. Connect to Vercel
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import your GitHub repository

### 2. Configure
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Environment Variables
Add in Vercel dashboard:
- `VITE_TMDB_API_KEY`: Your TMDB API key
- `VITE_API_BASE_URL`: Your Render backend URL

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Your app will be live!

## Troubleshooting

### Common Issues:

1. **Build Fails**: 
   - Check Python version (should be 3.11)
   - Ensure all dependencies are compatible

2. **Model Training Fails**:
   - Verify CSV files are present
   - Check file permissions

3. **API Errors**:
   - Verify TMDB API key is correct
   - Check CORS settings

### Support
If you encounter issues, check the build logs in Render dashboard for detailed error messages. 