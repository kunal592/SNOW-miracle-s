import { Storage } from './storage';

const API_BASE_URL = 'http://localhost:8090/api/v1';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone?: string;
}

export const api = {
  auth: {
    async login(email: string, password: string): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Login failed. Please verify credentials.');
      }

      const { user, tokens } = data.data;
      Storage.setTokens(tokens.accessToken, tokens.refreshToken);
      return { user, tokens };
    },

    async register(name: string, email: string, password: string): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Registration failed.');
      }

      const { user, tokens } = data.data;
      Storage.setTokens(tokens.accessToken, tokens.refreshToken);
      return { user, tokens };
    },

    async logout(): Promise<void> {
      const { refreshToken } = Storage.getTokens();
      try {
        if (refreshToken) {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
        }
      } catch (err) {
        console.warn('Backend logout call failed or offline:', err);
      } finally {
        Storage.clearTokens();
      }
    }
  }
};
