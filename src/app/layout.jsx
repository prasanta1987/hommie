import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { MusicPlayerProvider } from './context/MusicPlayerContext.jsx';
import GlobalMusicPlayer from './components/GlobalMusicPlayer.jsx';
import AppNavbar from './components/Navbar.jsx';
import PwaManager from './components/PwaManager.jsx';
import { AuthProvider } from './context/AuthContext';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/firebaseAdmin/config';

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  themeColor: "#0d6efd",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Hommie",
  description: "A Simple IOT Project",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hommie",
  },
  verification: {
    google: "k_-75L4T1YQTQDm61h9Aazvkn1u_MmddZy7vSGy6MNk",
  },
};

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hommie" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider initialUser={initialUser}>
          <MusicPlayerProvider>
            <AppNavbar />
            {children}
            <GlobalMusicPlayer />
            <PwaManager />
          </MusicPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
