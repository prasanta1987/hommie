'use client';

import { useState } from 'react';
import { handleSignIn, handleSignUp, getFirebaseErrorMessage } from '../miscFunctions/actions';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const singInHandler = async (e) => {
    e.preventDefault();
    handleSignIn(email, password)
      .then(() => {
        setError(null);
      })
      .catch((error) => {
        setError(getFirebaseErrorMessage(error.code));
      });
  }

  const singUpHandler = async (e) => {
    e.preventDefault();
    handleSignUp(email, password, displayName, setError)
      .then(() => {
        setError(null);
      })
      .catch((error) => {
        console.error(error);
        setError(getFirebaseErrorMessage(error.code));
      });
  }


  const handleSubmit = (e) => {
    if (isSignUp) {
      singUpHandler(e);
    } else {
      singInHandler(e);
    }
  };

  return (
    <div className='bg-dark d-flex justify-content-center align-items-center vh-100'>
      <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">{isSignUp ? 'Create an Account' : 'Sign In'}</h2>
          <div className="mb-3">
            {isSignUp
              &&
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                required
                className="mb-3 form-control"
              />
            }
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
