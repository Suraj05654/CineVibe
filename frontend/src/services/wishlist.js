import { ID, Query } from 'appwrite';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID } from './appwrite';

const normalizeWishlistMovie = (doc) => ({
  id: Number(doc.movieId),
  title: doc.title,
  poster_path: doc.poster_path || ''
});

const canUseWishlistCollection = APPWRITE_DATABASE_ID && APPWRITE_WISHLIST_COLLECTION_ID;

export const getWishlistByUser = async (userId) => {
  if (!canUseWishlistCollection || !userId) return [];

  const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]);

  return (response.documents || []).map(normalizeWishlistMovie);
};

export const addWishlistMovie = async (userId, movie) => {
  if (!canUseWishlistCollection || !userId) return;

  const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.equal('movieId', String(movie.id)),
    Query.limit(1)
  ]);

  if (existing.documents?.length) return;

  await databases.createDocument(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, ID.unique(), {
    userId,
    movieId: String(movie.id),
    title: movie.title,
    poster_path: movie.poster_path || '',
    createdAt: new Date().toISOString()
  });
};

export const removeWishlistMovie = async (userId, movieId) => {
  if (!canUseWishlistCollection || !userId) return;

  const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.equal('movieId', String(movieId)),
    Query.limit(1)
  ]);

  const documentId = existing.documents?.[0]?.$id;
  if (documentId) {
    await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, documentId);
  }
};
