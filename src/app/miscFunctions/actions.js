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


const regenerateApiKey = (apiKey, setIsApiKeyBTN, setApiKey, user) => {

  setIsApiKeyBTN(true);

  const oldKey = apiKey;
  const newKey = randomBytes(16).toString('hex');

  const multiUpdate = {};

  multiUpdate[`userCred/UIDtoAPI/${user.uid}`] = newKey;
  multiUpdate[`userCred/APItoUID/${newKey}`] = user.uid;

  if (oldKey) {
    multiUpdate[`userCred/APItoUID/${oldKey}`] = null;
  }

  // CRITICAL: Call the update on the root of the database
  updateValuesToDatabase("/", multiUpdate);

  setApiKey(newKey);
  setTimeout(() => {
    setIsApiKeyBTN(false);
  }, 5000);

}


function updateValuesToDatabase(reference, feed) {
  const dbRef = ref(db, reference);
  update(dbRef, feed)
    .then(() => console.log('Data Written Successfully'))
    .catch(err => console.log(err));
}

const setValueToDatabase = (reference, feed) => {
  const dbRef = ref(db, reference);
  set(dbRef, feed)
    .then(() => console.log('Data Written Successfully'))
    .catch(err => console.log(err));
}

const handleSignIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
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

      const multiUpdate = {};

      multiUpdate[`userCred/UIDtoAPI/${userCredential.user.uid}`] = apiKey;
      multiUpdate[`userCred/APItoUID/${apiKey}`] = userCredential.user.uid;

      updateValuesToDatabase(`/`, multiUpdate);

    } catch (error) {
      deleteUser(userCredential.user);
      setError('An error occurred while generating the API key.');
    }

  } catch (error) {
    setError(getFirebaseErrorMessage(error.code));
    console.error(error);
  }
};

const getFirebaseErrorMessage = (errorCode) => {
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
      return 'Password should be at least 6 characters.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const deleteUserAccount = (user, setShowProfileModal) => {
  if (user) {
    const uid = user.uid;
    const keyRef = ref(db, `userCred/UIDtoAPI/${uid}`);

    get(keyRef).then((snapshot) => {
      if (snapshot.exists()) {
        const apiKey = snapshot.val();
        const multiUpdate = {};
        multiUpdate[`userCred/UIDtoAPI/${uid}`] = null;
        multiUpdate[`userCred/APItoUID/${apiKey}`] = null;
        multiUpdate[uid] = null;

        updateValuesToDatabase(`/`, multiUpdate);
      } else {
        console.log('No API key found for this user.');
      }
    }).catch((error) => {
      console.log(error);
    });

    user.delete().then(() => {
      console.log('User account deleted successfully.');
    }).catch((error) => {
      console.log('Error deleting user account:', error);
    });


    setShowProfileModal(false);
  }
};

export {
  handleSignUp, handleSignIn,
  updateValuesToDatabase, setValueToDatabase,
  getFirebaseErrorMessage, regenerateApiKey,
  updateProfile, deleteUserAccount
}