import React, { useContext, createContext, useState, useEffect } from 'react';

type AuthContextType = {
  user: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  isLoading: boolean;
  isLogged: boolean;
  error: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
  isLogged: false,
  error: null,
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        setTimeout(() => {
          setUser('user');
          setIsLogged(true);
        });
      } catch (error) {
        setError('Erro ao carregar usuário');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  function login(email: string, password: string) {
    setUser(email);
  }

  const logout = () => {
    setUser(null);
    setIsLogged(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isLogged, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
