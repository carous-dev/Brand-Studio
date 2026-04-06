import { NextRequest } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields early and return a clear error
    const email = (body && (body.email || body.username)) || '';
    const password = body && body.password;
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Please provide email and password' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    // Normalize fields and forward only the credential fields to the upstream API
    const upstreamPayload: Record<string, any> = {};
    // prefer the same field shape as received; many backends accept `email` or `username`
    if (body.email) upstreamPayload.email = email;
    else if (body.username) upstreamPayload.username = email;
    else upstreamPayload.email = email;
    upstreamPayload.password = password;

    // Prepare payload to send upstream

    // Send credentials as application/x-www-form-urlencoded (upstream expects this)
    const formBody = new URLSearchParams();
    if (upstreamPayload.email) formBody.append('email', upstreamPayload.email);
    if (upstreamPayload.username) formBody.append('username', upstreamPayload.username);
    if (upstreamPayload.password) formBody.append('password', upstreamPayload.password);

    const res = await fetch('https://api.carous.co.uk/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: formBody.toString(),
    });

    // Inspect what's returned by the upstream API (read as text first)
    const upstreamText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(upstreamText);
    } catch (err) {
      data = { raw: upstreamText };
    }
    // upstream response inspected (logs removed)

    // Forward upstream errors/status so client sees the same message
    if (!res.ok || data?.error || !data?.user) {
      const status = res.status || 401;
      return new Response(JSON.stringify({ error: data?.error || 'Login failed' }), { status, headers: { 'Content-Type': 'application/json' } });
    }

    const user = data.user;
    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Not authorised' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    // Store a small HttpOnly cookie containing a base64-encoded JSON payload
    const cookieObj = { id: user.id, name: user.name, role: user.role, access_key: user.access_key };
    const cookieValue = Buffer.from(JSON.stringify(cookieObj)).toString('base64');

    const isProd = process.env.NODE_ENV === 'production';
    const cookieParts = [`kml_admin=${cookieValue}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${60 * 60 * 24 * 7}`];
    if (isProd) cookieParts.push('Secure');

    return new Response(JSON.stringify({ user: cookieObj }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieParts.join('; '),
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
