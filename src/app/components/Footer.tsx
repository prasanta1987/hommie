import admin from '@/app/firebase/adminConfig'
import React from 'react';

const Footer = async () => {
  let userCount = 0;
  try {
    const userRecords = await admin.auth().listUsers();
    userCount = userRecords.users.length;
    
    const data = admin.database().ref('users');
    const snapshot = await data.once('value');
    const usersData = snapshot.val();

    console.log(usersData);


  } catch (error) {
    console.error('Error fetching users:', error);
    // Handle the error appropriately
  }

  return (
    <footer className="footer mt-auto py-3 bg-light">
      <div className="container text-center">
        <span className="text-muted">Total Users: {userCount}</span>
      </div>
    </footer>
  );
};

export default Footer;
