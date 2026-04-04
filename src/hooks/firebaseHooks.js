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





import { ref, onValue } from 'firebase/database';
import { db } from '@/firebaseConfig/config'; // Import your DB instance here

export function useRTDB(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) return;

    // Create the reference inside the hook
    const dbRef = ref(db, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]); // Re-runs if the path string changes

  return { data, loading, error };
}
