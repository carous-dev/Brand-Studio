export async function POST(req: Request) {
  // Clear the cookie
  const isProd = process.env.NODE_ENV === 'production';
  const cookieParts = [`kml_admin=; Path=/; HttpOnly; Max-Age=0`, 'SameSite=Lax'];
  if (isProd) cookieParts.push('Secure');

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieParts.join('; '),
    },
  });
}
