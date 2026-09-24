import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { MusicPlayerProvider } from './context/MusicPlayerContext.jsx';
import GlobalMusicPlayer from './components/GlobalMusicPlayer.jsx';
import AppNavbar from './components/Navbar.jsx';

const inter = Inter({ subsets: ["latin"] });


export const metadata = {
  title: "Hommie",
  description: "A Simple IOT Project",
  icons: {
    icon: '/icon.png', // Path to your image in the public folder
  },
  verification: {
    google: "k_-75L4T1YQTQDm61h9Aazvkn1u_MmddZy7vSGy6MNk",
  },
};

import { AuthProvider } from './context/AuthContext';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/firebaseAdmin/config';

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
  let initialUser = null;

  if (sessionCookie) {
    const decoded = await verifySessionCookie(sessionCookie);
    if (decoded) {
      initialUser = { uid: decoded.uid, email: decoded.email };
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider initialUser={initialUser}>
          <MusicPlayerProvider>
            <AppNavbar />
            {children}
            <GlobalMusicPlayer />
          </MusicPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
