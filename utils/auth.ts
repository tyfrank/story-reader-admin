// Auth utility functions for admin panel

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://story-reader-backend-production.up.railway.app';

export async function refreshAuthToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (!refreshToken) return null;
    
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('adminToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('adminRefreshToken', data.refreshToken);
      }
      return data.accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

export async function apiRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  let token = localStorage.getItem('adminToken');
  
  // First attempt
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        }
      });
    }
  }
  
  return response;
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > exp;
  } catch (error) {
    return true;
  }
}

export function checkAndRefreshToken(): Promise<string | null> {
  const token = localStorage.getItem('adminToken');
  if (!token) return Promise.resolve(null);
  
  // Check if token expires in next 5 minutes
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const expiresIn = exp - Date.now();
    
    if (expiresIn < 5 * 60 * 1000) { // Less than 5 minutes
      return refreshAuthToken();
    }
    
    return Promise.resolve(token);
  } catch (error) {
    return refreshAuthToken();
  }
}