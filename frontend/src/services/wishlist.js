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
    const configError = new Error('Wishlist storage is not configured.');
    console.error(configError);
    throw configError;
  }
};

export const verifyWishlistCollectionAccess = async (userId) => {
  ensureWishlistConfig();

  if (!userId) {
    const userError = new Error('Missing user for wishlist permission verification.');
    console.error(userError);
    throw userError;
  }

  try {
    await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
      Query.equal('userId', userId),
      Query.limit(1)
    ]);
    console.log('COLLECTION READ PERMISSION VERIFIED');
  } catch (error) {
    console.error('COLLECTION READ PERMISSION FAILED', error);
    throw error;
  }

  try {
    const tempDocument = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_WISHLIST_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        movieId: `test-${Date.now()}`,
        title: 'TEMP_PERMISSION_TEST',
        poster_path: ''
      },
      [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId))
      ]
    );

    console.log('DB WRITE SUCCESS', tempDocument.$id);
    console.log('COLLECTION CREATE PERMISSION VERIFIED');

    await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, tempDocument.$id);
  } catch (error) {
    console.error('DB WRITE FAILED', error);
    throw error;
  }
};

export const fetchUserWatchlist = async (userId) => {
  if (!userId) {
    console.log('FETCH WISHLIST STOPPED: NO USER');
    return [];
  }

  ensureWishlistConfig();
  console.log('FETCH WISHLIST START', userId);

  const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(100)
  ]);

  const normalized = (response.documents || []).map(toWishlistItem);
  console.log('WISHLIST FETCH SUCCESS', normalized.length);
  return normalized;
};

export const addToWatchlist = async (userId, movie) => {
  ensureWishlistConfig();

  if (!userId) {
    const userError = new Error('Cannot add to wishlist without a logged-in user.');
    console.error(userError);
    throw userError;
  }

  const movieId = String(movie.id);
  console.log('ADD WISHLIST START', { userId, movieId });

  const duplicateResponse = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, [
    Query.equal('userId', userId),
    Query.equal('movieId', movieId),
    Query.limit(1)
  ]);

  if (duplicateResponse.documents?.length) {
    console.log('WISHLIST DUPLICATE FOUND', movieId);
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
      Permission.write(Role.user(userId))
    ]
  );

  console.log('WISHLIST DOCUMENT CREATED', document.$id);
  return toWishlistItem(document);
};

export const removeFromWatchlist = async (documentId) => {
  ensureWishlistConfig();

  if (!documentId) {
    const removeError = new Error('Missing wishlist document id for delete.');
    console.error(removeError);
    throw removeError;
  }

  console.log('REMOVE WISHLIST START', documentId);
  await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_WISHLIST_COLLECTION_ID, documentId);
  console.log('REMOVE WISHLIST SUCCESS', documentId);
};
