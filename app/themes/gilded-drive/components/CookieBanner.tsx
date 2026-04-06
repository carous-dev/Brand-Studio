"use client"

import React, { useEffect, useState } from 'react';
import { Lock, BarChart2, Megaphone, Cookie, Settings, X, Check, Shield, TrendingUp, Target } from 'lucide-react';
import useCookieConsent from '@/app/hooks/useCookieConsent';

export default function CookieBanner() {
  const { prefs, visible, acceptAll, declineAll, savePreferences, dismiss } = useCookieConsent();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
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
    setTimeout(() => setPanelVisible(false), 460);
  }

  function handleClosePanelImmediate() {
    setPanelOpen(false);
    setPanelVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-root">
      <div className={`cookie-banner-modern reveal ${visible ? 'in-view' : ''}`} role="region" aria-label="Cookie banner">
        <div className="cookie-banner-content">
          <div className="cookie-icon-wrapper">
            <div className="cookie-icon">
              <Cookie size={24} strokeWidth={2} />
            </div>
          </div>
          
          <div className="cookie-text">
            <h4 className="cookie-title">We value your privacy</h4>
            <p className="cookie-description">
              We use essential cookies to make our site work and optional cookies to enhance your experience. 
              <a href="/cookie-policy/" target="_blank" rel="noopener noreferrer" className="cookie-link">
                Learn more
              </a>
            </p>
          </div>

          <div className="cookie-actions">
            <button 
              className="cookie-btn cookie-btn-secondary" 
              type="button" 
              onClick={() => handleOpenPanel()}
            >
              <Settings size={16} strokeWidth={2} />
              <span>Customize</span>
            </button>
            
            <button 
              className="cookie-btn cookie-btn-outline" 
              type="button" 
              onClick={declineAll}
            >
              <X size={16} strokeWidth={2} />
              <span>Decline</span>
            </button>
            
            <button 
              className="cookie-btn cookie-btn-primary" 
              type="button" 
              onClick={acceptAll}
            >
              <Check size={16} strokeWidth={2} />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>

      {panelVisible && (
        <div className={`cookie-overlay-modern ${panelOpen ? 'open' : ''}`} onClick={() => handleClosePanel()} />
      )}

      {panelVisible && (
        <aside className={`cookie-panel-modern ${panelOpen ? 'open' : ''}`} role="dialog" aria-label="Cookie preferences">
          <div className="panel-header">
            <div className="panel-title-section">
              <div className="panel-icon">
                <Settings size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="panel-title">Cookie Preferences</h3>
                <p className="panel-subtitle">Choose what data you share with us</p>
              </div>
            </div>
            <button 
              className="panel-close-btn" 
              aria-label="Close preferences" 
              onClick={() => handleClosePanel()}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="panel-body">
            <div className="preferences-list">
              <div className="preference-item">
                <div className="preference-header">
                  <div className="preference-icon necessary">
                    <Lock size={20} strokeWidth={2} />
                  </div>
                  <div className="preference-info">
                    <h4 className="preference-title">Essential Cookies</h4>
                    <p className="preference-description">Required for core site functionality and security</p>
                  </div>
                  <div className="preference-status">
                    <span className="status-badge required">Always Active</span>
                  </div>
                </div>
              </div>

              <PreferenceToggle 
                idKey="analytics" 
                label="Analytics Cookies" 
                description="Help us improve our site by understanding how you use it"
                icon={TrendingUp}
              />
              
              <PreferenceToggle 
                idKey="marketing" 
                label="Marketing Cookies" 
                description="Show you personalized offers and relevant advertisements"
                icon={Target}
              />
            </div>
          </div>

          <div className="panel-footer">
            <div className="footer-content">
              <p className="footer-text">
                Your preferences are saved locally and can be changed at any time.
              </p>
              <div className="footer-actions">
                <button 
                  className="cookie-btn cookie-btn-secondary" 
                  onClick={() => { savePreferences({ analytics: false, marketing: false }); handleClosePanel(); }}
                >
                  Accept Essential Only
                </button>
                <button 
                  className="cookie-btn cookie-btn-primary" 
                  onClick={() => { savePreferences({ analytics: getSwitchState('analytics'), marketing: getSwitchState('marketing') }); handleClosePanel(); }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );

  function getSwitchState(key: string) {
    try {
      const el = document.querySelector(`.preference-toggle[data-key="${key}"]`);
      return !!(el && el.classList && el.classList.contains('active'));
    } catch (e) { return false; }
  }
}

function PreferenceToggle({ idKey, label, description, icon: Icon }: { 
  idKey: string; 
  label: string; 
  description: string; 
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }> 
}) {
  return (
    <div className="preference-item">
      <div className="preference-header">
        <div className={`preference-icon ${idKey}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="preference-info">
          <h4 className="preference-title">{label}</h4>
          <p className="preference-description">{description}</p>
        </div>
        <div className="preference-toggle" data-key={idKey}>
          <button 
            className="toggle-switch" 
            role="switch" 
            aria-checked="false" 
            tabIndex={0}
            onClick={(e) => toggle(e.currentTarget)}
            onKeyDown={(e) => { 
              if(e.key === 'Enter' || e.key === ' ') { 
                e.preventDefault(); 
                toggle(e.currentTarget); 
              } 
            }}
          >
            <div className="toggle-slider">
              <div className="toggle-knob" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  function toggle(button: HTMLButtonElement) {
    const toggle = button.closest('.preference-toggle');
    if (!toggle) return;
    
    toggle.classList.toggle('active');
    const isActive = toggle.classList.contains('active');
    button.setAttribute('aria-checked', isActive ? 'true' : 'false');
  }
}
