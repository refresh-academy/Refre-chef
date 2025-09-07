import { createContext } from 'react';

// Funzione centralizzata per tutte le fetch
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  console.log('apiFetch → url:', url, 'headers:', headers); // LOG PER DEBUG
  const opts = { ...options, headers };
  let response;
  try {
    response = await fetch(url, opts);
    if (response.status === 403) {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('userId');
      window.location.href = '/login';
      return;
    }
    return response;
  } catch (err) {
    throw err;
  }
}

export const ApiContext = createContext(apiFetch);