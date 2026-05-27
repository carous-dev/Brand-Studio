'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import '../styles/cookie.css';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      setHasConsented(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    setHasConsented(true);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
    setHasConsented(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (hasConsented || !isVisible) {
    return null;
  }

  return (
    <div className={`cookie-banner ${isVisible ? 'show' : ''}`}>
      <div className="cookie-left">
        <Cookie className="cookie-icon" />
        <div className="cookie-content">
          <h4>Cookie Notice</h4>
          <p>
            We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{' '}
            <a href="/cookies/" className="cookie-policy-link">Cookie Policy</a>.
          </p>
        </div>
      </div>
      <div className="cookie-actions">
        <button className="cookie-btn cookie-btn-reject" onClick={handleReject}>
          Reject
        </button>
        <button className="cookie-btn cookie-btn-accept" onClick={handleAccept}>
          Accept All
        </button>
        <button className="cookie-btn cookie-btn-close" onClick={handleDismiss} aria-label="Close cookie banner">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
