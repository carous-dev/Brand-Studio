import { NextRequest, NextResponse } from 'next/server';
import { testEmailConnection } from '@/app/lib/email.service';

export async function GET(request: NextRequest) {
  try {
    const result = await testEmailConnection();

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Email connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}