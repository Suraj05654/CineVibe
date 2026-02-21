import { ID, Permission, Query, Role } from 'appwrite';
import { databases, APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID } from './appwrite';

const hasWishlistConfig = Boolean(APPWRITE_DATABASE_ID && APPWRITE_WISHLIST_COLLECTION_ID);

const toWishlistItem = (document) => ({
  documentId: document.$id,
  movieId: document.movieId,
  id: Number(document.movieId),
  title: document.title,
  poster_path: document.poster_path || ''
});

const ensureWishlistConfig = () => {
  if (!hasWishlistConfig) {
    throw new Error('Wishlist storage is not configured.');
  }
};

export const fetchUserWatchlist = async (userId) => {
  if (!userId) return [];

  ensureWishlistConfig();

  const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]);

  return (response.documents || []).map(toWishlistItem);
};

export const addToWatchlist = async (userId, movie) => {
  ensureWishlistConfig();

  const movieId = String(movie.id);
  const duplicateResponse = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.equal('movieId', movieId),
    Query.limit(1)
  ]);

  if (duplicateResponse.documents?.length) {
    return toWishlistItem(duplicateResponse.documents[0]);
  }

  const document = await databases.createDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_WISHLIST_COLLECTION_ID,
    ID.unique(),
    {
      userId,
      movieId,
      title: movie.title,
      poster_path: movie.poster_path || ''
    },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId))
    ]
  );

  return toWishlistItem(document);
};

export const removeFromWatchlist = async (documentId) => {
  ensureWishlistConfig();

  await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, documentId);
};
