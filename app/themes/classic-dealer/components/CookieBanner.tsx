"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BarChart3, Target, X, Settings, Check, Cookie } from 'lucide-react';
import useCookieConsent from '@/app/hooks/useCookieConsent';
import '../styles/cookie.css';

export default function CookieBanner() {
  const { prefs, visible, acceptAll, declineAll, savePreferences, dismiss } = useCookieConsent();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    // sync panel with stored prefs if available
    if (prefs) {
      handleClosePanelImmediate();
    }
  }, [prefs]);

  function handleOpenPanel() {
    setPanelVisible(true);
    requestAnimationFrame(() => setPanelOpen(true));
  }

  function handleClosePanel() {
    setPanelOpen(false);
    setTimeout(() => setPanelVisible(false), 300);
  }

  function handleClosePanelImmediate() {
    setPanelOpen(false);
    setPanelVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-system">
      <AnimatePresence>
        <motion.div
          className="cookie-banner"
          role="region"
          aria-label="Cookie consent banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="banner-content">
            <div className="banner-icon">
              <Cookie size={32} />
            </div>

            <div className="banner-text">
              <h3 className="banner-title">We Value Your Privacy</h3>
              <p className="banner-description">
                We use cookies to enhance your experience and provide personalized content.
                <a href="/cookie-policy/" target="_blank" rel="noopener noreferrer" className="policy-link">
                  Learn more
                </a>
              </p>
            </div>

            <div className="banner-actions">
              <button
                className="btn-customize"
                onClick={handleOpenPanel}
                aria-label="Customize cookie preferences"
              >
                <Settings size={16} />
                <span>Customize</span>
              </button>

              <button
                className="btn-decline"
                onClick={declineAll}
                aria-label="Decline all cookies"
              >
                Decline All
              </button>

              <button
                className="btn-accept"
                onClick={acceptAll}
                aria-label="Accept all cookies"
              >
                <Check size={16} />
                <span>Accept All</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {panelVisible && (
          <>
            <motion.div
              className="cookie-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePanel}
            />

            <motion.aside
              className="cookie-panel"
              initial={{ x: '-100%' }}
              animate={{ x: panelOpen ? 0 : '-100%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              role="dialog"
              aria-label="Cookie preferences panel"
            >
              <div className="panel-header">
                <div className="panel-title">
                  <Shield size={24} />
                  <h2>Cookie Preferences</h2>
                </div>
                <button
                  className="panel-close"
                  onClick={handleClosePanel}
                  aria-label="Close preferences panel"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="panel-content">
                <div className="panel-intro">
                  <p>Choose which cookies you'd like to allow. You can change these settings at any time.</p>
                </div>

                <div className="cookie-preferences">
                  <CookiePreference
                    icon={<Shield size={20} />}
                    title="Essential Cookies"
                    description="Required for the website to function properly. Cannot be disabled."
                    required={true}
                    enabled={true}
                  />

                  <CookiePreference
                    icon={<BarChart3 size={20} />}
                    title="Analytics Cookies"
                    description="Help us understand how visitors interact with our website to improve user experience."
                    required={false}
                    enabled={getSwitchState('analytics')}
                    onToggle={(enabled) => toggleSwitch('analytics', enabled)}
                  />

                  <CookiePreference
                    icon={<Target size={20} />}
                    title="Marketing Cookies"
                    description="Used to deliver personalized advertisements and track campaign effectiveness."
                    required={false}
                    enabled={getSwitchState('marketing')}
                    onToggle={(enabled) => toggleSwitch('marketing', enabled)}
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button
                  className="btn-save"
                  onClick={() => {
                    savePreferences({
                      analytics: getSwitchState('analytics'),
                      marketing: getSwitchState('marketing')
                    });
                    handleClosePanel();
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  function getSwitchState(key: string) {
    try {
      const el = document.querySelector(`.cookie-toggle[data-key="${key}"]`);
      return !!(el && el.classList && el.classList.contains('active'));
    } catch (e) { return false; }
  }

  function toggleSwitch(key: string, enabled: boolean) {
    try {
      const el = document.querySelector(`.cookie-toggle[data-key="${key}"]`);
      if (el) {
        if (enabled) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    } catch (e) { /* ignore */ }
  }
}

function CookiePreference({
  icon,
  title,
  description,
  required = false,
  enabled = false,
  onToggle
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  required?: boolean;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  const handleToggle = () => {
    if (required) return;

    const newState = !isEnabled;
    setIsEnabled(newState);
    onToggle?.(newState);
  };

  return (
    <div className={`cookie-preference ${required ? 'required' : ''}`}>
      <div className="preference-icon">
        {icon}
      </div>

      <div className="preference-content">
        <div className="preference-header">
          <h4 className="preference-title">{title}</h4>
          {required && <span className="required-badge">Required</span>}
        </div>
        <p className="preference-description">{description}</p>
      </div>

      {!required && (
        <button
          className={`cookie-toggle ${isEnabled ? 'active' : ''}`}
          onClick={handleToggle}
          aria-label={`Toggle ${title.toLowerCase()} cookies`}
          data-key={title.toLowerCase().replace(' cookies', '')}
        />
      )}
    </div>
  );
}
