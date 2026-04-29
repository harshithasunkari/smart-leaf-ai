// Simple auth store — no external state lib needed
export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authStore = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also store user_id for legacy compatibility
    localStorage.setItem('user_id', String(user.id));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    this.clearToken();
  },
};