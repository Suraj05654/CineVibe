import { ID, Permission, Query, Role } from 'appwrite';
import { account, databases, APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID } from './appwrite';

const normalizeWishlistMovie = (doc) => ({
  documentId: doc.$id,
  id: Number(doc.movieId),
  title: doc.title,
  poster_path: doc.poster_path || ''
});

const canUseWishlistCollection = APPWRITE_DATABASE_ID && APPWRITE_WISHLIST_COLLECTION_ID;

const ensureSessionForUser = async (userId) => {
  if (!userId) return null;

  try {
    const currentUser = await account.get();
    if (currentUser?.$id !== userId) return null;
    return currentUser;
  } catch {
    return null;
  }
};

export const getWishlistByUser = async (userId) => {
  if (!canUseWishlistCollection || !userId) return [];

  const sessionUser = await ensureSessionForUser(userId);
  if (!sessionUser) return [];

  const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]);

  return (response.documents || []).map(normalizeWishlistMovie);
};

export const addWishlistMovie = async (userId, movie) => {
  if (!canUseWishlistCollection || !userId) return null;

  const sessionUser = await ensureSessionForUser(userId);
  if (!sessionUser) return null;

  const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.equal('movieId', String(movie.id)),
    Query.limit(1)
  ]);

  if (existing.documents?.length) return normalizeWishlistMovie(existing.documents[0]);

  const created = await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, ID.unique(), {
    userId,
    movieId: String(movie.id),
    title: movie.title,
    poster_path: movie.poster_path || ''
  }, [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId))
  ]);

  return normalizeWishlistMovie(created);
};

export const removeWishlistMovie = async (userId, documentId) => {
  if (!canUseWishlistCollection || !documentId || !userId) return;

  const sessionUser = await ensureSessionForUser(userId);
  if (!sessionUser) return;

  await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, documentId);
};
