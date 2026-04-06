import { useState, useCallback } from 'react';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

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

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function useEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<EmailResult | null>(null);

  const sendEmail = useCallback(async (emailData: EmailData): Promise<EmailResult> => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result: EmailResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: EmailResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };

      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendLeadEmail = useCallback(async (
    leadData: LeadEmailData,
    recipientEmail?: string
  ): Promise<EmailResult> => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/send-lead-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadData,
          recipientEmail,
        }),
      });

      const result: EmailResult = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send lead email');
      }

      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: EmailResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };

      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/test-email-connection', {
        method: 'GET',
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test email connection',
      };
    }
  }, []);

  return {
    sendEmail,
    sendLeadEmail,
    testConnection,
    isLoading,
    lastResult,
  };
}

export default useEmail;
