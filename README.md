# 🎬 CineVibe – Movie Recommender

Find movies you’ll love, instantly.  
CineVibe uses AI and TMDB data to recommend films based on your favorites.

---

## Features
- 🎥 Get smart movie recommendations
- 🔥 See trending movies
- 🔎 Search the full database
- ✨ Beautiful, modern UI

---

## Quick Start

1. **Get a TMDB API Key:**  
   [Create one here](https://www.themoviedb.org/settings/api)

2. **Install dependencies:**  
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && pip install -r requirements.txt
   ```

3. **Add your API key:**  
   Create a `.env` file in both `frontend/` and `backend/`:
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   ```

4. **Run the app:**  
   ```bash
   npm run dev
   ```
   - Frontend: [localhost:5173](http://localhost:5173)
   - Backend: [localhost:5000](http://localhost:5000)

---

## Project Structure

```
movie_recommender/
  frontend/   # React + Vite + Tailwind
  backend/    # Flask + Python
  README.md
```

- Model/data files are auto-generated if missing.
- Cache and build files are ignored by git.

---

## Clean Code Promise

- No unused files or code.
- Only essential dependencies.
- Easy to read, easy to contribute.

---

## Need Help?

Open an issue or PR—happy to help!

---

**Enjoy your movie night! 🍿** 