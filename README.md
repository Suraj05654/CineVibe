# Movie Recommender 🎬

A smart movie recommendation app that suggests films you'll actually enjoy. Built with React and Python, it uses AI to find movies similar to your favorites.

## What It Does

- **Get Movie Recommendations**: Enter any movie and get 8 similar films
- **Browse Trending**: See what's popular right now
- **Search Movies**: Find any movie in the database
- **Beautiful UI**: Dark theme with smooth animations

## Quick Start

### 1. Get Your TMDB API Key
- Go to [TMDB](https://www.themoviedb.org/settings/api)
- Sign up and get your API key (the short one, not the long token)

### 2. Setup
```bash
# Install everything
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

### 3. Add Your API Key
Create `.env` files in both `frontend/` and `backend/` folders:
```
VITE_TMDB_API_KEY=your_api_key_here
```

### 4. Run It
```bash
npm run dev
```
This starts both frontend (localhost:5173) and backend (localhost:5000).

## How It Works

The app uses a smart algorithm that:
1. Analyzes movie features (genre, cast, plot, etc.)
2. Finds movies with similar characteristics
3. Fetches fresh data from TMDB (posters, ratings, etc.)
4. Shows you the best matches

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask + Python + scikit-learn
- **Data**: TMDB API for movie info

## Project Structure
```
movie_recommender/
├── frontend/          # React app
├── backend/           # Flask API
└── README.md
```

## Deployment

### Frontend (Vercel)
- Connect your GitHub repo to Vercel
- Add environment variables in Vercel dashboard
- Deploy automatically on push

### Backend (Railway/Heroku/Render)
- Deploy Flask app to your preferred platform
- Set environment variables
- Update frontend API URL
- The CSV datasets are included in the repository
- Model files (`.pkl`) are generated automatically during deployment using `train_model.py`

## Contributing

Found a bug? Want to add a feature? 
1. Fork the repo
2. Make your changes
3. Submit a pull request

## Support

Having issues? Open a GitHub issue and I'll help you out!

---

**Happy movie hunting! 🍿** 