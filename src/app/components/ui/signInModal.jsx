import { Modal, Form, Button, Navbar, Nav, Container } from 'react-bootstrap';
import { useState } from 'react';
import { handleSignIn, handleSignUp, getFirebaseErrorMessage } from '@/app/miscFunctions/actions';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";

export default function SingInModal({
    showSignInModal, setShowSignInModal
}) {


    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);


    const singInHandler = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await handleSignIn(email, password);
        } catch (error) {
            console.log(error.code);
            const message = getFirebaseErrorMessage(error.code);
            console.log(message);
            setError(message);
        }
    }


    const handleSubmit = (e) => {
        if (isSignUp) {
            singUpHandler(e);
        } else {
            singInHandler(e);
        }
    };

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

    const deleteUser = async () => {
        if (!email || !password) {
            alert('Email and Password Required')
            return;
        };

        const credential = EmailAuthProvider.credential(user.email, password); // You need the user's password
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);

    }


    return (
        <Modal show={showSignInModal} onHide={() => setShowSignInModal(false)} centered data-bs-theme="dark">
            <Modal.Header closeButton>
                <Modal.Title>{isSignUp ? 'Create an Account' : 'Sign In'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <form onSubmit={handleSubmit}>
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
                </form>
            </Modal.Body>
        </Modal>
    );
}