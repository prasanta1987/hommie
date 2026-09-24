'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/firebaseConfig/config';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children, initialUser }) => {
  // If initialUser exists from the server, we start with it and loading is false!
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,
      (firebaseUser) => {
        // Only update if it changes, or if initialUser was missing
        setUser(firebaseUser || initialUser);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
