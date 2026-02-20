import { Account, Client } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

export const authService = {
  getUser: async () => {
    try {
      return await account.get();
    } catch {
      return null;
    }
  },
  login: (email, password) => account.createEmailPasswordSession(email, password),
  logout: async () => {
    try {
      await account.deleteSession('current');
    } catch {
      // no-op
    }
  },
  getWishlist: async (userId) => {
    if (!userId) return [];
    const prefs = await account.getPrefs();
    const list = Array.isArray(prefs.wishlist) ? prefs.wishlist : [];
    return list
      .filter((item) => item?.userId === userId)
      .map((item) => ({
        id: item.movieId,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        overview: item.overview
      }));
  },
  toggleWishlist: async (userId, movie) => {
    const prefs = await account.getPrefs();
    const current = Array.isArray(prefs.wishlist) ? prefs.wishlist : [];
    const exists = current.some((entry) => entry.userId === userId && entry.movieId === movie.id);

    const next = exists
      ? current.filter((entry) => !(entry.userId === userId && entry.movieId === movie.id))
      : [
          ...current,
          {
            userId,
            movieId: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            overview: movie.overview
          }
        ];

    await account.updatePrefs({ ...prefs, wishlist: next });

    return next
      .filter((item) => item.userId === userId)
      .map((item) => ({
        id: item.movieId,
        title: item.title,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        overview: item.overview
      }));
  }
};
