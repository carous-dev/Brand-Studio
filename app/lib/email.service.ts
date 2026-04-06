import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import path from 'path';

// Email service configuration
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email service interface
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

// Send email function
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate required environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
    }

    const mailOptions = {
      from: options.from || `"${process.env.SMTP_FROM_NAME || 'Car Dealership'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while sending email',
    };
  }
}

// Test email connection
export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.verify();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to email server',
    };
  }
}

// Lead email service - specialized for lead notifications
export interface LeadEmailData {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  preferred_contact?: string;
  preferredContact?: string;
  vehicle_name?: string;
  vehicleName?: string;
  stock_id?: string;
  stockId?: string;
  enquiry_type?: string;
  enquiryType?: string;
  location?: string;
  year?: string;
  mileage?: string;
  condition?: string;
  additional_info?: string;
  additionalInfo?: string;
  dashboard_link?: string;
  dashboardLink?: string;
  vehicleDetails?: {
    registration?: string;
    make?: string;
    model?: string;
    mileage?: string;
    condition?: string;
    year?: string;
  };
  leadType: 'sell-your-car' | 'contact-us' | 'dealer-enquiry';
}

export async function sendLeadEmail(
  leadData: LeadEmailData,
  recipientEmail?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { getBrand } = await import('./getBrand');
    const brand = await getBrand();
    if (!brand) {
      throw new Error('Brand configuration not found.');
    }
    
    // Default recipient if not specified
    const to = recipientEmail || process.env.SMTP_USER || 'info@jdcarsales.co.uk';

    // Generate subject based on lead type
    const subjectMap = {
      'sell-your-car': 'New Vehicle Valuation Lead',
      'contact-us': 'New Contact Form Submission',
      'dealer-enquiry': 'New Dealer Enquiry',
    };

    const subject = `${subjectMap[leadData.leadType]} - ${brand.name}`;

    // Generate HTML content from templates
    const htmlContent = await renderLeadEmailTemplate(leadData);

    return await sendEmail({
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send lead email',
    };
  }
}

const leadTemplateMap: Record<LeadEmailData['leadType'], string> = {
  'sell-your-car': 'sell-your-car-lead.html',
  'contact-us': 'contact-us-lead.html',
  'dealer-enquiry': 'dealer-enquiry-lead.html',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatText(value?: string): string {
  if (!value) return '';
  return escapeHtml(String(value));
}

function formatMultiline(value?: string): string {
  if (!value) return '';
  return escapeHtml(String(value)).replace(/\r?\n/g, '<br>');
}

function buildDashboardLink(leadData: LeadEmailData): string {
  const direct = leadData.dashboard_link || leadData.dashboardLink;
  if (direct) return String(direct);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  if (!siteUrl) return '';
  return `${siteUrl.replace(/\/$/, '')}/dashboard/leads`;
}

function buildVehicleName(leadData: LeadEmailData): string {
  const explicit = leadData.vehicle_name || leadData.vehicleName;
  if (explicit) return String(explicit);
  const make = leadData.vehicleDetails?.make;
  const model = leadData.vehicleDetails?.model;
  const reg = leadData.vehicleDetails?.registration;
  const composite = [make, model].filter(Boolean).join(' ');
  return composite || (reg ? String(reg) : '');
}

function buildTemplateValues(leadData: LeadEmailData): Record<string, string> {
  const vehicle = leadData.vehicleDetails || {};
  const message = leadData.message || '';
  const additionalInfo = leadData.additional_info || leadData.additionalInfo || message;
  return {
    name: formatText(leadData.name),
    email: formatText(leadData.email),
    phone: formatText(leadData.phone),
    subject: formatText(leadData.subject),
    message: formatMultiline(message),
    preferred_contact: formatText(leadData.preferred_contact || leadData.preferredContact),
    vehicle_name: formatText(buildVehicleName(leadData)),
    stock_id: formatText(leadData.stock_id || leadData.stockId || vehicle.registration),
    enquiry_type: formatText(leadData.enquiry_type || leadData.enquiryType),
    location: formatText(leadData.location),
    make: formatText(vehicle.make),
    model: formatText(vehicle.model),
    year: formatText(leadData.year || vehicle.year),
    mileage: formatText(leadData.mileage || vehicle.mileage),
    condition: formatText(leadData.condition || vehicle.condition),
    additional_info: formatMultiline(additionalInfo),
    dashboard_link: formatText(buildDashboardLink(leadData)),
  };
}

async function loadLeadTemplate(leadType: LeadEmailData['leadType']): Promise<string> {
  const filename = leadTemplateMap[leadType];
  const templatePath = path.join(process.cwd(), 'app', 'emails', filename);
  return await readFile(templatePath, 'utf8');
}

async function renderLeadEmailTemplate(leadData: LeadEmailData): Promise<string> {
  try {
    const template = await loadLeadTemplate(leadData.leadType);
    const values = buildTemplateValues(leadData);
    return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : '';
    });
  } catch (error) {
    console.warn('Failed to load lead template, falling back to default HTML.', error);
    return generateLeadEmailHTML(leadData);
  }
}

// Generate HTML content for lead emails
function generateLeadEmailHTML(leadData: LeadEmailData): string {
  const { name, email, phone, message, vehicleDetails, leadType } = leadData;

  const titleMap = {
    'sell-your-car': 'Vehicle Valuation Lead',
    'contact-us': 'Contact Form Submission',
    'dealer-enquiry': 'Dealer Enquiry',
  };

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${titleMap[leadType]}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #495057; }
        .value { color: #212529; }
        .vehicle-details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${titleMap[leadType]}</h2>
          <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="content">
          <div class="field">
            <div class="label">Lead Type:</div>
            <div class="value">${titleMap[leadType]}</div>
          </div>`;

  if (name) {
    html += `
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name}</div>
          </div>`;
  }

  if (email) {
    html += `
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${email}</div>
          </div>`;
  }

  if (phone) {
    html += `
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${phone}</div>
          </div>`;
  }

  if (vehicleDetails) {
    html += `
          <div class="vehicle-details">
            <h3>Vehicle Details</h3>`;

    if (vehicleDetails.registration) {
      html += `<div class="field"><div class="label">Registration:</div><div class="value">${vehicleDetails.registration}</div></div>`;
    }
    if (vehicleDetails.make) {
      html += `<div class="field"><div class="label">Make:</div><div class="value">${vehicleDetails.make}</div></div>`;
    }
    if (vehicleDetails.model) {
      html += `<div class="field"><div class="label">Model:</div><div class="value">${vehicleDetails.model}</div></div>`;
    }
    if (vehicleDetails.mileage) {
      html += `<div class="field"><div class="label">Mileage:</div><div class="value">${vehicleDetails.mileage}</div></div>`;
    }
    if (vehicleDetails.condition) {
      html += `<div class="field"><div class="label">Condition:</div><div class="value">${vehicleDetails.condition}</div></div>`;
    }

    html += `</div>`;
  }

  if (message) {
    html += `
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
          </div>`;
  }

  html += `
        </div>
      </div>
    </body>
    </html>`;

  return html;
}

export default {
  sendEmail,
  sendLeadEmail,
  testEmailConnection,
};
