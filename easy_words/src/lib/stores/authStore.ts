import { writable } from "svelte/store"; // Svelte store for managing authentication state

export const accessToken = writable<string | null>(null); // Store for access token
export const isAuthenticated = writable<boolean>(false); // Store for authentication status