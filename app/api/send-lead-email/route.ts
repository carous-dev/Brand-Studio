import { NextRequest, NextResponse } from 'next/server';
import { sendLeadEmail, LeadEmailData } from '@/app/lib/email.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadData, recipientEmail } = body;

    // Validate required fields
    if (!leadData || !leadData.leadType) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: leadData with leadType' },
        { status: 400 }
      );
    }

    // Validate leadType
    const validLeadTypes = ['sell-your-car', 'contact-us', 'dealer-enquiry'];
    if (!validLeadTypes.includes(leadData.leadType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid leadType. Must be one of: sell-your-car, contact-us, dealer-enquiry' },
        { status: 400 }
      );
    }

    const result = await sendLeadEmail(leadData as LeadEmailData, recipientEmail);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Lead email API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}