import { create } from 'zustand';
import { hashPassword } from '../utils/crypto';
import { executeQuery } from '../lib/models/base';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const hashedPassword = await hashPassword(password);
    const user = executeQuery(
      'SELECT id, email FROM users WHERE email = ? AND password_hash = ?',
      [email, hashedPassword]
    )[0] as User | undefined;
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    set({ user });
  },
  signOut: () => {
    set({ user: null });
  },
  checkAuth: async () => {
    set({ loading: false });
  },
}));