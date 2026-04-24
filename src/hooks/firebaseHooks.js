'use client'

import { useState, useEffect } from 'react';
import { auth } from '@/firebaseConfig/config';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}


import { getDatabase, ref, onValue } from 'firebase/database';

export function useRTDB(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get the database instance directly inside the hook
    // to prevent issues with stale instances in a dev environment.
    const db = getDatabase();
    const dbRef = ref(db, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}
