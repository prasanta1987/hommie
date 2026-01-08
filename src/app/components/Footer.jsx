'use client'
import { useObjectVal } from 'react-firebase-hooks/database';
import { ref } from 'firebase/database';
import { db } from '../firebase/config'
import { Spinner } from 'react-bootstrap';

const Footer = (props) => {

    const [dbData, dataLoading, dataError] = useObjectVal(props.userData ? ref(db, "device") : null);


    console.log(dbData);

    return (
        <footer className="bg-dark text-light p-2 text-center sticky-bottom">
            <div className="container">
                {
                    dataLoading && <Spinner />
                }
            </div>
        </footer>
    );
}

export default Footer;
