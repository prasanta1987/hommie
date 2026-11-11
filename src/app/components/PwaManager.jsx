'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function PwaManager() {
  const pathname = usePathname();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const swRegistrationRef = useRef(null);

  // Check if running in standalone/installed mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInstalled);
  }, []);

  // 1. Service Worker Registration & Update Lifecycle
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let refreshing = false;

    // Prevent infinite reload loop on controllerchange
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      console.log('[PWA] Controller changed: new build is now active. Refreshing page...');
      setIsUpdating(true);
      setTimeout(() => {
        window.location.reload();
      }, 600);
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // Listen to messages from Service Worker
    const onSwMessage = (event) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        const newVersion = event.data.version;
        const currentVersion = sessionStorage.getItem('hommie_pwa_version');
        console.log('[PWA] SW_ACTIVATED received with version:', newVersion);

        if (currentVersion && currentVersion !== newVersion) {
          sessionStorage.setItem('hommie_pwa_version', newVersion);
          setUpdateAvailable(true);
          setIsUpdating(true);
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          sessionStorage.setItem('hommie_pwa_version', newVersion);
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', onSwMessage);

    // Register Service Worker
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        swRegistrationRef.current = registration;
        console.log('[PWA] Service Worker registered with scope:', registration.scope);

        // Check if there is already an updated SW waiting to activate
        if (registration.waiting) {
          console.log('[PWA] An updated Service Worker is waiting.');
          setUpdateAvailable(true);
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // When a new SW is discovered
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          console.log('[PWA] Update found! Installing new worker...');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New build installed and ready
                console.log('[PWA] New build is installed. Triggering activation...');
                setUpdateAvailable(true);
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', onSwMessage);
    };
  }, []);

  // 2. Periodic & Contextual Update Checks
  const checkForUpdates = async () => {
    try {
      // 1. Check ServiceWorker directly
      if (swRegistrationRef.current) {
        await swRegistrationRef.current.update();
      }

      // 2. Check version.json for build timestamp changes
      const res = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const data = await res.json();
        const serverVersion = data.version;
        const currentVersion = sessionStorage.getItem('hommie_pwa_version');

        if (!currentVersion) {
          sessionStorage.setItem('hommie_pwa_version', serverVersion);
        } else if (currentVersion !== serverVersion) {
          console.log(`[PWA] Build mismatch detected! Local: ${currentVersion}, Server: ${serverVersion}`);
          setUpdateAvailable(true);
          sessionStorage.setItem('hommie_pwa_version', serverVersion);
          if (swRegistrationRef.current) {
            await swRegistrationRef.current.update();
          }
          // Activate update
          setIsUpdating(true);
          setTimeout(() => {
            window.location.reload();
          }, 800);
        }
      }
    } catch (err) {
      // Silently ignore offline or network errors during update checks
    }
  };

  // Check on tab visibility change (e.g. user switches back to app)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    const handleOnline = () => {
      console.log('[PWA] App is back online. Checking for latest build...');
      checkForUpdates();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Periodic check every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);

  // Check for updates on route navigation
  useEffect(() => {
    checkForUpdates();
  }, [pathname]);

  // 3. Install Prompt Handling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);

      // Check if user previously dismissed prompt in this session
      const dismissed = sessionStorage.getItem('hommie_install_dismissed');
      if (!dismissed && !isStandalone) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWA] Hommie was successfully installed!');
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  // Handle Install Click
  const handleInstallClick = async () => {
    // If native prompt is available (Chrome, Edge, Android)
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      // If iOS device
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        setShowIosGuide(true);
      } else {
        alert('To install Hommie, use your browser menu and choose "Install App" or "Add to Home Screen".');
      }
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('hommie_install_dismissed', 'true');
  };

  const handleManualUpdate = () => {
    setIsUpdating(true);
    if (swRegistrationRef.current?.waiting) {
      swRegistrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <>
      {/* 1. Update Notification Toast */}
      {(updateAvailable || isUpdating) && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#0d6efd',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '90vw',
            animation: 'fadeInDown 0.3s ease-out',
          }}
        >
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
            style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}
          />
          <span>
            {isUpdating
              ? 'Updating to the latest build...'
              : 'New version available! Refreshing to update...'}
          </span>
          <button
            onClick={handleManualUpdate}
            style={{
              backgroundColor: '#ffffff',
              color: '#0d6efd',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            Update Now
          </button>
        </div>
      )}

      {/* 2. Install App Banner */}
      {showInstallBanner && !isStandalone && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            left: 'auto',
            maxWidth: '400px',
            width: 'calc(100vw - 40px)',
            zIndex: 9990,
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            padding: '14px 16px',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image
              src="/icons/icon-192x192.png"
              alt="Hommie"
              width={44}
              height={44}
              style={{
                borderRadius: '10px',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>Install Hommie</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.3 }}>
                Install app for instant access and full-screen experience.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={dismissBanner}
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                borderRadius: '6px',
              }}
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              style={{
                backgroundColor: '#0d6efd',
                color: '#ffffff',
                border: 'none',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Install App
            </button>
          </div>
        </div>
      )}

      {/* 3. iOS Installation Guide Modal / Tooltip */}
      {showIosGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowIosGuide(false)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/icons/icon-192x192.png"
              alt="Hommie"
              width={64}
              height={64}
              style={{ borderRadius: '14px', marginBottom: '16px' }}
            />
            <h5 style={{ fontWeight: 700, marginBottom: '8px' }}>Install on iPhone / iPad</h5>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
              1. Tap the <strong>Share</strong> button <span style={{ fontSize: '18px' }}>⎋</span> at the bottom of Safari.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong> <span style={{ fontSize: '18px' }}>➕</span>.<br />
              3. Tap <strong>Add</strong> in the top-right corner.
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              style={{
                backgroundColor: '#0d6efd',
                color: '#ffffff',
                border: 'none',
                padding: '8px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

