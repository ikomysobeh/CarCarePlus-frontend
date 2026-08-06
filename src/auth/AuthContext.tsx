import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { http, tokenStore, unwrap } from '../api/client';
import { endpoints } from '../api/endpoints';
import { ApiError, type ApiResponse, type AuthUser } from '../api/types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (u: AuthUser | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On boot, if we have a token, fetch the profile to restore the session.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    unwrap<AuthUser>(http.get<ApiResponse<AuthUser>>(endpoints.profile.show))
      .then(setUser)
      .catch((e) => {
        // Only a real auth failure (401) means the token is invalid -> drop it.
        // A server hiccup (500) or network blip must NOT log the user out.
        if (e instanceof ApiError && e.status_code === 401) {
          tokenStore.clear();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await unwrap<AuthUser>(
      http.post<ApiResponse<AuthUser>>(endpoints.auth.login, { email, password }),
    );
    if (u.token) tokenStore.set(u.token);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await http.post(endpoints.auth.logout);
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
