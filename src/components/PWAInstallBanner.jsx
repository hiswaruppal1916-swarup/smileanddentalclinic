import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Share, Sparkles, Smartphone } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Helper to check live standalone / PWA mode using browser APIs
  const checkIsStandalone = useCallback(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }, []);

  useEffect(() => {
    // 1. Check live standalone mode
    const standaloneMode = checkIsStandalone();
    setIsStandalone(standaloneMode);
    if (standaloneMode) {
      return;
    }

    // 2. Listen to standalone mode changes (e.g. app installed and launched)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e) => {
      setIsStandalone(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    // 3. Check temporary session dismissal state for the large banner
    const dismissedThisSession = sessionStorage.getItem('sdc_pwa_banner_dismissed') === 'true';
    setIsBannerDismissed(dismissedThisSession);

    // 4. Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser's default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);

      // Only show the large banner if user has not clicked Later/Close in this session
      if (!checkIsStandalone() && sessionStorage.getItem('sdc_pwa_banner_dismissed') !== 'true') {
        setIsBannerVisible(true);
      }
      console.log('[PWA] Native beforeinstallprompt captured successfully.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Listen for appinstalled event (fired when user completes installation)
    const handleAppInstalled = () => {
      console.log('[PWA] App successfully installed by user.');
      setIsBannerVisible(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = ua.includes('safari') && !ua.includes('crios') && !ua.includes('fxios');

    if (isIOSDevice && isSafari && !standaloneMode) {
      setIsIOS(true);
      if (!dismissedThisSession) {
        const timer = setTimeout(() => {
          if (!checkIsStandalone()) {
            setIsBannerVisible(true);
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, [checkIsStandalone]);

  // Trigger real native install prompt or iOS guide
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log('[PWA] User choice outcome:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
          setIsBannerVisible(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('[PWA] Error calling prompt():', err);
      }
    } else if (isIOS) {
      // Open or toggle guided instructions on iOS
      setShowIOSGuide((prev) => !prev);
      if (!isBannerVisible) {
        setIsBannerVisible(true);
      }
    }
  };

  // Close / Later action for large banner
  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    setShowIOSGuide(false);
    setIsBannerDismissed(true);
    sessionStorage.setItem('sdc_pwa_banner_dismissed', 'true');
  };

  // If running inside the installed PWA, render NOTHING
  if (isStandalone) {
    return null;
  }

  // Installation is available if we have deferredPrompt OR we are on iOS Safari in browser mode
  const isInstallAvailable = Boolean(deferredPrompt || isIOS);

  if (!isInstallAvailable) {
    return null;
  }

  return (
    <>
      {/* 1. LARGE ANIMATED INSTALL BANNER (Shown initially or until dismissed) */}
      {isBannerVisible && (
        <aside
          role="banner"
          aria-label="Install Smile & Dental Clinic App"
          className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slide-up"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-teal-200/90 p-4 sm:p-5 shadow-2xl space-y-3">
            {/* Header Row: [Logo] [Title & Subtitle] [Close (×)] */}
            <div className="flex items-start gap-3.5">
              <img
                src="/assets/icon-192.png"
                alt="Smile & Dental Clinic Logo"
                className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-sm sm:text-base text-navy truncate">
                    Install Smile & Dental Clinic App
                  </h3>
                  <button
                    onClick={handleDismissBanner}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                    title="Close banner"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  Quick access to appointments & instant notifications.
                </p>
              </div>
            </div>

            {/* Action Row: [Install App] [Later] */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-md"
              >
                <Download className="w-4 h-4" /> Install App
              </button>
              <button
                onClick={handleDismissBanner}
                className="px-4 py-2.5 rounded-xl font-heading font-semibold text-xs sm:text-sm text-slate-600 hover:text-navy hover:bg-slate-100 active:scale-95 transition-all"
              >
                Later
              </button>
            </div>

            {/* iOS Safari Guided Steps */}
            {showIOSGuide && (
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2 animate-fadeIn">
                <p className="font-bold text-navy flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-teal-600" /> To install on iOS Safari:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1 leading-relaxed">
                  <li>
                    Tap the <strong className="text-navy">Share button</strong> (square with arrow) at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and select <strong className="text-navy">Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong className="text-navy">Add</strong> in the top-right corner.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 2. FLOATING CORNER INSTALL BUTTON (Bottom-Left)
          Visible when running in normal browser, installable, and large banner is dismissed/hidden.
          Situated on bottom-left so it NEVER overlaps WhatsApp, Call, or Book Now (bottom-right). */}
      {!isBannerVisible && (
        <aside
          aria-label="Install App Quick Access"
          className="fixed bottom-5 left-4 z-40 safe-pb animate-fadeIn"
        >
          <button
            onClick={handleInstallClick}
            className="group flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white/95 hover:bg-white text-navy hover:text-teal-700 border border-teal-200/90 rounded-full shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-200 active:scale-95 text-xs font-semibold"
            title="Install Smile & Dental Clinic App"
            aria-label="Install App"
          >
            <img
              src="/assets/icon-192.png"
              alt=""
              className="w-5 h-5 rounded-md object-contain shrink-0"
            />
            <span className="hidden sm:inline font-heading">Install App</span>
            <Download className="w-3.5 h-3.5 text-teal-600 sm:hidden shrink-0" />
          </button>
        </aside>
      )}
    </>
  );
}
