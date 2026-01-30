import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig/config';
import { ref, onValue, get, set, update } from 'firebase/database';


const updateValuesToDatabase = (reference, feed) => {
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

  const handleSignIn = async (e, email, password) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
    }
  };

export { handleSignIn, updateValuesToDatabase, setValueToDatabase }