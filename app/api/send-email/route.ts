import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, EmailOptions } from '@/app/lib/email.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, cc, bcc, replyTo } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    const emailOptions: EmailOptions = {
      to,
      subject,
      html,
      cc,
      bcc,
      replyTo,
    };

    const result = await sendEmail(emailOptions);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}