
'use client';

import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { redirect } from 'next/navigation';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [user] = useAuthState(auth);
  
  
  if (user) {
     redirect('/'); // Redirect to login page if no user
    }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(getFirebaseErrorMessage(error.code));
      console.error(error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        setError(getFirebaseErrorMessage(error.code));
        console.error(error);
    }
  };

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/weak-password':
          return 'Password should be at least 6 characters.'
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (isSignUp) {
      handleSignUp(e);
    } else {
      handleSignIn(e);
    }
  }

  return (
    <div className='d-flex justify-content-center align-items-center vh-100'>
      <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
          <div className="mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="form-control"
              />
          </div>
          <div className="mb-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="form-control"
              />
          </div>

          {error && <p className="text-danger text-center mb-3">{error}</p>}

          <div className="d-grid">
            <button type="submit" className='btn btn-primary'>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
          <p className="mt-3 text-center">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
