import { NextRequest, NextResponse } from 'next/server'
import { sendLeadEmail, type LeadEmailData } from '@/app/lib/email.service'

function clean(value: unknown, maxLength = 1000): string {
  return String(value ?? '').trim().slice(0, maxLength)
}

function appendLine(lines: string[], label: string, value: unknown) {
  const text = clean(value)
  if (text) lines.push(`${label}: ${text}`)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 })
    }

    const name = clean((body as any).name, 160) || 'WhatsApp visitor'
    const phone = clean((body as any).phone, 80)
    const message = clean((body as any).message, 4000)

    if (!phone && !message) {
      return NextResponse.json(
        { success: false, error: 'A phone number or message is required.' },
        { status: 400 },
      )
    }

    const details: string[] = []
    appendLine(details, 'Dealer', (body as any).dealerName)
    appendLine(details, 'Lead owner', (body as any).leadOwner)
    appendLine(details, 'Intent', (body as any).intentId)
    appendLine(details, 'Page title', (body as any).pageTitle)
    appendLine(details, 'Page URL', (body as any).pageUrl)

    const leadData: LeadEmailData = {
      leadType: 'dealer-enquiry',
      name,
      phone,
      subject: clean((body as any).subject, 180) || 'WhatsApp enquiry',
      message: [message, details.length ? details.join('\n') : ''].filter(Boolean).join('\n\n'),
      enquiryType: 'WhatsApp enquiry',
      preferredContact: 'WhatsApp',
    }

    const result = await sendLeadEmail(leadData)
    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    )
  }
}
