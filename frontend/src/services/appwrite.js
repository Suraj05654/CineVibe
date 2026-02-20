import { Account, Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const APPWRITE_WISHLIST_COLLECTION_ID = import.meta.env.VITE_APPWRITE_WISHLIST_COLLECTION_ID;
