export const HOST = import.meta.env.VITE_SPACETIMEDB_HOST ?? 'ws://localhost:3000';
export const DB_NAME = import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? 'greenquest-db';
export const AUTH_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN ?? '';
export const AUTH_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID ?? '';