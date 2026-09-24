import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

export const verifySessionCookie = async (sessionCookie) => {
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    return { uid: decodedClaims.uid, email: decodedClaims.email };
  } catch (error) {
    return null;
  }
};

export const createSessionCookie = async (idToken, expiresIn) => {
  return admin.auth().createSessionCookie(idToken, { expiresIn });
};

export const revokeAllSessions = async (sessionCookie) => {
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie);
    return admin.auth().revokeRefreshTokens(decodedClaims.sub);
  } catch (error) {
    return null;
  }
};
