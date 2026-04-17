const API_URL = import.meta.env.VITE_API_URL || 'https://emplay-assignment-kappa.vercel.app/';

const fetchWithCreds = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'API request failed');
  }
  return res.json();
};

export const api = {
  login: (data: any) => fetchWithCreds('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  signup: (data: any) => fetchWithCreds('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => fetchWithCreds('/auth/logout', { method: 'POST' }),
  getMe: () => fetchWithCreds('/auth/me', { method: 'GET' }),
  
  getPrompts: () => fetchWithCreds('/prompts'),
  getPromptById: (id: string) => fetchWithCreds(`/prompts/${id}`),
  createPrompt: (data: any) => fetchWithCreds('/prompts', { method: 'POST', body: JSON.stringify(data) }),
  deletePrompt: (id: string) => fetchWithCreds(`/prompts/${id}`, { method: 'DELETE' }),
};
