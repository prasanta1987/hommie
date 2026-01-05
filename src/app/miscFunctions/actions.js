import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, dbAddress } from '../firebase/config';
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


export { updateValuesToDatabase, setValueToDatabase }