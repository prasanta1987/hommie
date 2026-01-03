
'use client';

import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

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
    <div className='signInContainer'>
      <form onSubmit={handleSubmit}>
        <h2>{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="inputField"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="inputField"
        />
        {error && <p className="error">{error}</p>}
        <div className="buttonContainer">
            <button type="submit" className='signInButton'>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
        </div>
        <p className="toggleText">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a href="#" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
