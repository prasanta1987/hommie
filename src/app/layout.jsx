import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { MusicPlayerProvider } from './context/MusicPlayerContext.jsx';
import GlobalMusicPlayer from './components/GlobalMusicPlayer.jsx';
import AppNavbar from './components/Navbar.jsx';

const inter = Inter({ subsets: ["latin"] });

{/* <meta name="google-site-verification" content="k_-75L4T1YQTQDm61h9Aazvkn1u_MmddZy7vSGy6MNk" /> */ }

export const metadata = {
  title: "Hommie",
  description: "A Simple IOT Project",
  verification: {
    google: "k_-75L4T1YQTQDm61h9Aazvkn1u_MmddZy7vSGy6MNk",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <MusicPlayerProvider>
          <AppNavbar />
          {children}
          <GlobalMusicPlayer />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
