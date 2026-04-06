/**
 * Brand-Specific Configuration Resolver
 * Gets brand-specific settings (email, API, etc.) with proper fallbacks
 */

import type { BrandConfig } from '@/brands/types';

/**
 * Get email configuration for a brand
 * Falls back to environment variables if brand config is missing
 */
export function getEmailConfig(brand: BrandConfig) {
  return {
    smtpHost: brand.email?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: brand.email?.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
    smtpSecure: brand.email?.smtpSecure ?? (process.env.SMTP_SECURE === 'true'),
    smtpUser: brand.email?.smtpUser || process.env.SMTP_USER || '',
    smtpPass: brand.email?.smtpPass || process.env.SMTP_PASS || '',
    smtpFrom: brand.email?.smtpFrom || process.env.SMTP_FROM || '',
    smtpFromName: brand.email?.smtpFromName || process.env.SMTP_FROM_NAME || brand.name,
  };
}

/**
 * Get API configuration for a brand
 * Falls back to environment variables if brand config is missing
 */
export function getApiConfig(brand: BrandConfig) {
  return {
    inventorySyncApiKey: brand.api?.inventorySyncApiKey || process.env.SYNC_API_KEY,
    ollamaApi: brand.api?.ollamaApi || process.env.OLLAMA_API,
    ollamaChatEndpoint: brand.api?.ollamaChatEndpoint || process.env.OLLAMA_CHAT_ENDPOINT,
    ollamaModel: brand.api?.ollamaModel || process.env.OLLAMA_MODEL,
  };
}

/**
 * Get brand-specific or fallback contact info
 */
export function getContactInfo(brand: BrandConfig) {
  return {
    phone: brand.location.phone,
    email: brand.location.email,
    address: brand.location.fullAddress,
    city: brand.location.address.city,
    postcode: brand.location.address.postcode,
  };
}

/**
 * Get brand-specific or fallback support configuration
 */
export function getSupportConfig(brand: BrandConfig) {
  return {
    agentName: process.env.NEXT_PUBLIC_SUPPORT_AGENT_NAME || `${brand.name} Support`,
    agentAvatar: process.env.NEXT_PUBLIC_SUPPORT_AGENT_AVATAR || brand.logo,
    wsUrl: process.env.NEXT_PUBLIC_SUPPORT_WS_URL || 'ws://localhost:4001',
  };
}

/**
 * Get complete brand-aware configuration
 * Use this when you need multiple config categories
 */
export function getBrandConfiguration(brand: BrandConfig) {
  return {
    email: getEmailConfig(brand),
    api: getApiConfig(brand),
    contact: getContactInfo(brand),
    support: getSupportConfig(brand),
    brand: {
      name: brand.name,
      domain: brand.domain,
      logo: brand.logo,
    },
  };
}
