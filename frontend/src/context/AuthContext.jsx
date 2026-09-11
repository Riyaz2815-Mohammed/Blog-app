import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem('blog_session');
    if (s) setSession(JSON.parse(s));
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('blog_session', JSON.stringify(data));
    setSession(data);
  };

  const logout = () => {
    localStorage.removeItem('blog_session');
    setSession(null);
  };

  const updateUser = (user) => {
    const next = { ...session, user };
    localStorage.setItem('blog_session', JSON.stringify(next));
    setSession(next);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
