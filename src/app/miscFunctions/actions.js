import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser
} from 'firebase/auth';

import { auth, db } from '../../firebaseConfig/config';
import { ref, onValue, get, set, update } from 'firebase/database';
import { randomBytes } from 'crypto';
import { getAuth } from 'firebase/auth';


const regenerateApiKey = async (apiKey, setIsApiKeyBTN, user) => {

  setIsApiKeyBTN(true);

  const oldKey = apiKey;
  const newKey = randomBytes(16).toString('hex');

  const multiUpdate = {};

  multiUpdate[`userCred/UIDtoAPI/${user.uid}/fbAPIKey`] = newKey;
  multiUpdate[`userCred/APItoUID/${newKey}/fbUID`] = user.uid;

  if (oldKey) {
    multiUpdate[`userCred/APItoUID/${oldKey}/fbUID`] = null;
  }

  // CRITICAL: Call the update on the root of the database
  await updateValuesToDatabase("/", multiUpdate);

  setTimeout(() => {
    setIsApiKeyBTN(false);
  }, 5000);

}


const updateValuesToDatabase = async (reference, feed) => {
  const dbRef = ref(db, reference);
  update(dbRef, feed)
    .then(() => console.log('Data Written Successfully'))
    .catch(err => console.log(err));
}

const setValueToDatabase = async (reference, feed) => {
  const dbRef = ref(db, reference);
  set(dbRef, feed)
    .then(() => console.log('Data Written Successfully'))
    .catch(err => console.log(err));
}

const handleSignIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error
  }
};

const handleSignUp = async (email, password, displayName, setError) => {

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user,
      {
        displayName: displayName,
      }
    )


    try {
      const apiKey = randomBytes(16).toString('hex');
      const user = userCredential.user;

      const multiUpdate = {};

      multiUpdate[`userCred/UIDtoAPI/${user.uid}/fbAPIKey`] = apiKey;
      multiUpdate[`userCred/APItoUID/${apiKey}/fbUID`] = user.uid;

      updateValuesToDatabase(`/`, multiUpdate);

    } catch (error) {
      deleteUser(userCredential.user);
      setError('An error occurred while generating the API key.');
      throw error
    }

  } catch (error) {
    console.error(error);
    throw error
  }
};

const getFirebaseErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Invalid Credentials.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'This email is already in use.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    default:
      return code;
  }
};



export {
  handleSignUp, handleSignIn,
  updateValuesToDatabase, setValueToDatabase,
  getFirebaseErrorMessage, regenerateApiKey,
  updateProfile
}