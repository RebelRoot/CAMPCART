import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  img?: string;
  college: string;
  state?: string;
  gender?: string;
  isSeller: boolean;
  isVerifiedStore?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    restoreUser();
  }, []);

  const restoreUser = async () => {
    try {
      const stored = await SecureStore.getItemAsync('currentUser');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Failed to restore user:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    const userData = res.data;
    // Store token from response body (more reliable than set-cookie header in React Native)
    if (userData.accessToken) {
      await SecureStore.setItemAsync('accessToken', userData.accessToken);
    }
    await SecureStore.setItemAsync('currentUser', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: any) => {
    await api.post('/auth/register', data);
    // Auto-login after register
    await login(data.username, data.password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout API errors
    }
    await SecureStore.deleteItemAsync('currentUser');
    await SecureStore.deleteItemAsync('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
