import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, address?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: { name?: string; address?: string; phone?: string; password?: string }) => Promise<boolean>;
  clearError: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to load persisted token
    const storedToken = localStorage.getItem('store_auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      setError(null);
      const res = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token might be expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Ошибка сетевого соединения при входе');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Ошибка входа');
        return false;
      }

      localStorage.setItem('store_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError('Ошибка соединения с сервером');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, address?: string, phone?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, address, phone })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Ошибка регистрации');
        return false;
      }

      localStorage.setItem('store_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      setError('Ошибка соединения с сервером');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('store_auth_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updates: { name?: string; address?: string; phone?: string; password?: string }): Promise<boolean> => {
    if (!token) return false;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Ошибка обновления профиля');
        return false;
      }

      setUser(data);
      return true;
    } catch (err) {
      setError('Ошибка соединения с сервером');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      clearError,
      getAuthHeaders
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
