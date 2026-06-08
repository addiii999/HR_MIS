import { createContext, useContext, useState, useEffect } from 'react';
import { getStore, saveStore, initStore } from '@/store';

const AuthContext = createContext(null);

/**
 * Provides authentication state and actions to the component tree.
 * Session is persisted in sessionStorage — cleared on tab/browser close.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStore();
    const saved = sessionStorage.getItem('hr_mis_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const store = getStore();
    const found = store.users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      sessionStorage.setItem('hr_mis_user', JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('hr_mis_user');
  };

  /** Returns true if the current user has any of the provided roles. */
  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
