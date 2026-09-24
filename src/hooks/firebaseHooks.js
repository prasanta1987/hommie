'use client'

import { useState, useEffect } from 'react';
import { auth } from '@/firebaseConfig/config';
import { onAuthStateChanged } from 'firebase/auth';

import { useAuthContext } from '@/app/context/AuthContext';

export function useAuth() {
  return useAuthContext();
}


import { getDatabase, ref, onValue } from 'firebase/database';

export function useRTDB(path) {
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined' && path) {
      const cached = localStorage.getItem(`rtdb_${path}`);
      try {
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && path) {
      return !localStorage.getItem(`rtdb_${path}`);
    }
    return true;
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      return;
    }

    // Check cache in case path changed after mount
    const cached = localStorage.getItem(`rtdb_${path}`);
    if (cached) {
      try {
        setData(JSON.parse(cached));
        setLoading(false);
      } catch (e) {}
    } else {
      setLoading(true);
    }

    // Get the database instance directly inside the hook
    const db = getDatabase();
    const dbRef = ref(db, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      setData(val);
      setLoading(false);
      
      // Cache the response
      if (val) {
        localStorage.setItem(`rtdb_${path}`, JSON.stringify(val));
      } else {
        localStorage.removeItem(`rtdb_${path}`);
      }
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}
