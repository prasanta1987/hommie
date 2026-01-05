
import React from 'react';
import admin from '@/app/firebase/adminConfig';

const Footer = async () => {
  let usersData = null;
  let error = null;

  try {
    const data = admin.database().ref('xUXsdrqmjlTC4MMYz2COmOfwSCD3');
    const snapshot = await data.once('value');
    usersData = snapshot.val();
    console.log('Successfully fetched data:', usersData);
  } catch (e: any) {
    error = e.message;
    console.error('Firebase error:', e.message);
    if (admin.apps.length) {
      console.log('Admin SDK initialized for project:', admin.app().options.projectId);
    } else {
      console.log('Admin SDK not initialized.');
    }
  }

  return (
    <footer className="bg-gray-800 text-dark p-4 text-center">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} My Awesome App. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
