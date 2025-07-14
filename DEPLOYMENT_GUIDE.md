# 🚀 Deployment Guide (CineVibe)

## Backend (Render, Railway, Heroku, etc.)
1. Push your code to GitHub.
2. Create a new web service on your platform (Python environment).
3. Set build/start commands:
   - Build: `cd backend && pip install -r requirements.txt`
   - Start: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
4. Add environment variable: `VITE_TMDB_API_KEY=your_api_key_here`
5. Deploy and grab your backend URL.

## Frontend (Vercel, Netlify, etc.)
1. Import your repo to Vercel/Netlify.
2. Set root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `VITE_TMDB_API_KEY=your_api_key_here`
   - `VITE_API_BASE_URL=your_backend_url`
6. Deploy and your app is live!

## Tips
- Use Python 3.11+ for backend.
- If you see build/model errors, check your API key and CSV files.
- For help, open an issue or check your platform’s build logs.

---

Happy deploying! 🚀 