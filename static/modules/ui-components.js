/**
 * UI Components Module
 * Handles rendering and UI display logic
 */

import { DOMUtils } from './dom-utils.js';

export const UIComponents = {
  /**
   * Show alert notification
   */
  showAlert(message, type = 'info', container = null) {
    const alert = DOMUtils.createElement('div', {
      class: `alert alert-${type}`
    }, `
      <span>${message}</span>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `);
    
    const alertContainer = container || DOMUtils.getElement('alertContainer');
    if (alertContainer) {
      alertContainer.appendChild(alert);
      
      setTimeout(() => {
        DOMUtils.remove(alert);
      }, 4000);
    }
  },

  /**
   * Render brand preview
   */
  renderBrandPreview(brand, accentColor, container) {
    if (!container) return;
    
    const previewHTML = `
      <div class="brand-preview-content" style="border-top: 4px solid ${accentColor};">
        <div style="text-align: center;">
          <div class="preview-name" style="color: ${accentColor};">${brand.name}</div>
          <div class="preview-tagline">${brand.tagline}</div>
          <div class="preview-contact">
            <div class="preview-contact-item">📍 ${brand.location.city}, ${brand.location.county}</div>
            <div class="preview-contact-item">📞 ${brand.location.phone}</div>
            <div class="preview-contact-item">✉️ ${brand.location.email}</div>
            <div class="preview-contact-item">🌐 ${brand.domain}</div>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = previewHTML;
  },

  /**
   * Update preview colors
   */
  updatePreviewColors(color, container) {
    if (!container) return;
    
    const preview = DOMUtils.querySelector('.brand-preview-content', container);
    if (preview) {
      preview.style.borderTopColor = color;
      const nameElement = DOMUtils.querySelector('.preview-name', preview);
      if (nameElement) {
        nameElement.style.color = color;
      }
    }
  },

  /**
   * Render brand table rows
   */
  renderBrandsTable(brands, container, callbacks = {}) {
    if (!container) return;
    
    if (brands.length === 0) {
      container.innerHTML = `
        <tr class="empty-state">
          <td colspan="6">
            <div class="empty-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3>No brands yet</h3>
              <p>Create your first brand to get started</p>
              <a href="/create" class="btn-primary">Create Brand</a>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const html = brands.map(brand => {
      const primaryColor = brand.theme?.colors?.accentPrimary || brand.primary_color || '#c41e3a';
      const location = brand.location || {};
      const city = location.city || location.address?.city || 'Not set';
      const county = location.county || location.address?.county || '';
      const domain = brand.domain || '';
      
      // Use online checker status, fallback to is_active for backward compatibility
      const status = brand.status || (brand.is_active !== false ? 'online' : 'offline');
      const isOnline = status === 'online';
      
      const isSpecial = brand.special === true;

      return `
      <tr data-slug="${brand.slug}" class="${isSpecial ? 'row-special' : ''}">
        <td>
          <div class="brand-cell">
            <div class="brand-icon">
              ${brand.favicon ? 
                `<img src="${brand.favicon}" data-favicon-path="${brand.favicon}" data-brand-domain="${brand.domain}" alt="${brand.name || 'Brand'} favicon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div class="brand-icon-fallback" style="background: ${primaryColor}; color: white; display: none;">
                   ${brand.name ? brand.name.charAt(0).toUpperCase() : 'B'}
                 </div>` :
                `<div class="brand-icon-fallback" style="background: ${primaryColor}; color: white;">
                   ${brand.name ? brand.name.charAt(0).toUpperCase() : 'B'}
                 </div>`
              }
            </div>
            <div class="brand-info">
              <div class="brand-name">${isSpecial ? '<span class="special-star" title="Special — on the live monitor">★</span> ' : ''}${this.escapeHtml(brand.name || 'Unnamed Brand')}</div>
              ${brand.tagline ? `<div class="brand-tagline">${this.escapeHtml(brand.tagline)}</div>` : ''}
            </div>
          </div>
        </td>
        <td class="col-domain">
          ${(() => {
            if (!domain) return '-';
            // When the backend tags a brand with a local-dev preview URL
            // (lvh.me / sslip.io / etc.), link there instead of https://<domain>
            // so dev-mode clicks land on the running Next.js dev server.
            const previewUrl = brand.preview_url || '';
            const href = previewUrl
              ? previewUrl
              : (domain.startsWith('http') ? domain : 'https://' + domain);
            const localChip = brand.preview_url_kind === 'local-dev'
              ? ' <span class="status-badge status-active" style="margin-left:6px;font-size:0.65rem;vertical-align:middle;">local</span>'
              : '';
            return `<a href="${href}" target="_blank" style="color: var(--accent); text-decoration: none;">${this.escapeHtml(domain.replace('http://', '').replace('https://', ''))}</a>${localChip}`;
          })()}
        </td>
        <td class="col-location">${this.escapeHtml(city + (county ? ', ' + county : ''))}</td>
        <td class="col-theme">
          <div class="theme-color">
            <div class="color-swatch" style="background: ${primaryColor};"></div>
            <span class="theme-name">${this.escapeHtml(brand._theme_name || brand.theme?.id || brand.themeId || '—')}</span>
          </div>
        </td>
        <td class="col-status">
          <span class="status-badge ${isOnline ? 'online' : 'offline'}">
            <span class="status-indicator"></span>
            ${isOnline ? 'Online' : 'Offline'}
          </span>
        </td>
        <td class="col-actions">
          <div class="table-actions">
            <button class="action-btn special ${isSpecial ? 'is-special' : ''}" data-action="special" data-slug="${brand.slug}" aria-pressed="${isSpecial ? 'true' : 'false'}" title="${isSpecial ? 'Unmark special' : 'Mark as special (add to live monitor)'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSpecial ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button class="action-btn edit" data-action="edit" data-slug="${brand.slug}" title="Edit Brand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete" data-action="delete" data-slug="${brand.slug}" title="Delete Brand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `}).join('');

    // Clone the container to remove old event listeners
    const newContainer = container.cloneNode(false);
    if (container.parentNode) {
      container.parentNode.replaceChild(newContainer, container);
    }
    newContainer.innerHTML = html;

    // Fix favicon URLs to use the correct host from the brand's domain
    const faviconImages = newContainer.querySelectorAll('img[data-favicon-path]');
    faviconImages.forEach(img => {
      const faviconPath = img.dataset.faviconPath;
      const brandDomain = img.dataset.brandDomain;
      if (faviconPath && brandDomain) {
        try {
          // Extract host from brand domain (e.g., localhost:3000/citimotors -> localhost:3000)
          const url = new URL(brandDomain.startsWith('http') ? brandDomain : 'https://' + brandDomain);
          const host = url.origin; // Gets http://localhost:3000
          img.src = host + faviconPath;
        } catch (error) {
          console.warn('Failed to extract host from domain, using fallback:', error);
          img.src = 'http://localhost:3000' + faviconPath;
        }
      }
    });
    newContainer.addEventListener('click', (e) => {
      const button = e.target.closest('.action-btn');
      if (!button) return;

      const action = button.dataset.action;
      const slug = button.dataset.slug;

      if (action === 'edit' && window.brandStudio) {
        window.brandStudio.editBrand(slug);
      } else if (action === 'delete' && window.brandStudio) {
        window.brandStudio.confirmDeleteBrand(slug);
      } else if (action === 'special' && window.brandStudio) {
        window.brandStudio.toggleSpecial(slug);
      }
    });
  },

  /**
   * Render brands grid
   */
  renderBrandsGrid(brands, container, callbacks = {}) {
    if (!container) return;
    
    if (brands.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3>No brands created yet</h3>
          <p>Create your first brand to get started</p>
        </div>
      `;
      return;
    }

    container.className = 'brands-grid';
    container.innerHTML = brands.map(brand => {
      const primaryColor = brand.theme?.colors?.accentPrimary || brand.primary_color || '#c41e3a';
      const location = brand.location || {};
      const city = location.city || location.address?.city || 'Not set';
      const county = location.county || location.address?.county || '';
      const domain = brand.domain || '';
      
      // Use online checker status, fallback to is_active for backward compatibility
      const status = brand.status || (brand.is_active !== false ? 'online' : 'offline');
      const isOnline = status === 'online';

      // Automation lifecycle (set by the Linux provisioning thread; empty for
      // legacy previews that pre-date this feature). Surface as a small badge
      // so operators can see at a glance which brands are live vs failed vs
      // mid-provisioning. See /api/previews/<slug>/automation-status for live polling.
      const automation = (brand && brand._automation) || {};
      const aStatus = automation.status || '';
      const aStep = automation.step || '';
      const aMessage = automation.message || automation.error || '';
      const aTooltip = [aStep, aMessage].filter(Boolean).join(' — ');

      return `
        <div class="brand-card" data-slug="${brand.slug}" data-automation-status="${aStatus}">
          <div class="brand-card-header" style="background: ${primaryColor};">
            <div class="brand-logo">
              ${brand.name ? brand.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div class="brand-status ${isOnline ? 'online' : 'offline'}">
              <span class="status-dot"></span>
            </div>
            ${aStatus ? `<div class="automation-badge automation-${aStatus}" title="${this.escapeHtml(aTooltip)}">${this.escapeHtml(aStatus)}</div>` : ''}
          </div>
          <div class="brand-card-body">
            <h3 class="brand-name">${this.escapeHtml(brand.name || 'Unnamed Brand')}</h3>
            ${brand.tagline ? `<p class="brand-tagline">${this.escapeHtml(brand.tagline)}</p>` : ''}
            <div class="brand-meta">
              <div class="brand-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${this.escapeHtml(city + (county ? ', ' + county : ''))}
              </div>
              ${domain ? `
                <div class="brand-domain">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M2 12h20"></path>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <a href="${domain.startsWith('http') ? domain : 'https://' + domain}" target="_blank">${this.escapeHtml(domain.replace('http://', '').replace('https://', ''))}</a>
                </div>
              ` : ''}
            </div>
            <div class="brand-color-preview">
              <div class="color-swatch" style="background: ${primaryColor};"></div>
              <span class="color-value">${primaryColor}</span>
            </div>
          </div>
          <div class="brand-card-actions">
            <button class="action-btn delete" data-action="delete" data-slug="${brand.slug}" title="Delete Brand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add event delegation for grid card actions
    container.addEventListener('click', (e) => {
      const button = e.target.closest('.action-btn');
      if (!button) return;

      const action = button.dataset.action;
      const slug = button.dataset.slug;

      if (action === 'delete' && window.brandStudio) {
        window.brandStudio.confirmDeleteBrand(slug);
      }
    });

    // Poll any in-flight cards (status = pending|provisioning) every 3s and
    // update the badge as the automation thread reports progress. Stops as
    // soon as the card reaches a terminal status (live/failed/skipped) or
    // gets re-rendered by the next list refresh.
    this._startAutomationPolling(container);
  },

  _startAutomationPolling(container) {
    if (!container) return;
    if (this._automationPollHandle) {
      clearInterval(this._automationPollHandle);
      this._automationPollHandle = null;
    }
    const poll = async () => {
      const cards = Array.from(container.querySelectorAll('.brand-card[data-automation-status="pending"], .brand-card[data-automation-status="provisioning"]'));
      if (cards.length === 0) {
        clearInterval(this._automationPollHandle);
        this._automationPollHandle = null;
        return;
      }
      await Promise.all(cards.map(async (card) => {
        const slug = card.getAttribute('data-slug');
        if (!slug) return;
        try {
          const res = await fetch(`/api/previews/${encodeURIComponent(slug)}/automation-status`, { cache: 'no-store' });
          if (!res.ok) return;
          const body = await res.json();
          const a = body && body.automation ? body.automation : {};
          const newStatus = a.status || '';
          const newStep = a.step || '';
          const newMsg = a.message || a.error || '';
          card.setAttribute('data-automation-status', newStatus);
          const badge = card.querySelector('.automation-badge');
          if (badge) {
            badge.textContent = newStatus;
            badge.title = [newStep, newMsg].filter(Boolean).join(' — ');
            badge.className = 'automation-badge automation-' + (newStatus || '');
          }
        } catch (e) {
          /* swallow — next tick will retry */
        }
      }));
    };
    this._automationPollHandle = setInterval(poll, 3000);
    // First tick after a short delay so the operator sees motion fast.
    setTimeout(poll, 600);
  },

  /**
   * Render keyword chips
   */
  renderKeywordChips(keywords, container) {
    if (!container) return;
    
    container.innerHTML = keywords.map(keyword => `
      <div class="keyword-chip">
        <span class="keyword-text">${keyword}</span>
        <button type="button" class="keyword-remove" onclick="window.brandStudio.removeKeywordChip('${keyword}')">×</button>
      </div>
    `).join('');
  },

  /**
   * Render file preview
   */
  renderFilePreview(file, previewContainer, uploadArea) {
    if (!previewContainer || !uploadArea) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const previewImage = DOMUtils.querySelector('.preview-image', previewContainer);
      if (previewImage) {
        previewImage.src = e.target.result;
      }
      
      const uploadContent = DOMUtils.querySelector('.file-upload-content', uploadArea);
      DOMUtils.hide(uploadContent);
      DOMUtils.show(previewContainer, 'flex');
    };
    
    reader.readAsDataURL(file);
  },

  /**
   * Update dashboard statistics display
   */
  updateDashboardStats(stats) {
    const elements = {
      dashboardCount: 'dashboardCount',
      activeCount: 'activeCount',
      domainCount: 'domainCount',
      heroBrandCount: 'heroBrandCount',
      heroActiveCount: 'heroActiveCount',
      heroDomainCount: 'heroDomainCount'
    };

    if (stats.total !== undefined) {
      const dashboardCount = DOMUtils.getElement(elements.dashboardCount);
      if (dashboardCount) dashboardCount.textContent = stats.total;
      
      const heroBrandCount = DOMUtils.getElement(elements.heroBrandCount);
      if (heroBrandCount) heroBrandCount.textContent = stats.total;
    }

    if (stats.active !== undefined) {
      const activeCount = DOMUtils.getElement(elements.activeCount);
      if (activeCount) activeCount.textContent = stats.active;
      
      const heroActiveCount = DOMUtils.getElement(elements.heroActiveCount);
      if (heroActiveCount) heroActiveCount.textContent = stats.active;
    }

    if (stats.withDomain !== undefined) {
      const domainCount = DOMUtils.getElement(elements.domainCount);
      if (domainCount) domainCount.textContent = stats.withDomain;
      
      const heroDomainCount = DOMUtils.getElement(elements.heroDomainCount);
      if (heroDomainCount) heroDomainCount.textContent = stats.withDomain;
    }
  },

  /**
   * Update brand count display
   */
  updateBrandCount(count) {
    const elements = ['brandCount', 'headerBrandCount', 'navBadge'];
    elements.forEach(id => {
      const el = DOMUtils.getElement(id);
      if (el) el.textContent = count;
    });
  },

  /**
   * Create delete confirmation modal
   */
  createDeleteModal(brandName, onConfirm) {
    const modal = DOMUtils.createElement('div', {
      id: 'deleteModal',
      class: 'delete-modal'
    }, `
      <div class="delete-modal-content">
        <h4>Delete Brand?</h4>
        <p>Are you sure you want to delete <strong class="brand-to-delete">${this.escapeHtml(brandName)}</strong>? This action cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn btn-cancel" onclick="document.getElementById('deleteModal')?.classList.remove('active')">Cancel</button>
          <button class="btn btn-confirm-delete">Delete</button>
        </div>
      </div>
    `);

    const confirmBtn = DOMUtils.querySelector('.btn-confirm-delete', modal);
    if (confirmBtn) {
      confirmBtn.onclick = onConfirm;
    }

    return modal;
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Create placeholder HTML
   */
  createPlaceholder(message) {
    return `
      <div class="placeholder-text">
        <p>${message}</p>
      </div>
    `;
  }
};

export default UIComponents;
