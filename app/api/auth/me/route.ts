export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.split(';').map(s=>s.trim()).find(s => s.startsWith('kml_admin='));
    if (!match) {
      return new Response(JSON.stringify({ user: null }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const value = match.split('=')[1] || '';
    let user = null;
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      user = JSON.parse(decoded);
    } catch (e) {
      return new Response(JSON.stringify({ user: null }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Basic check
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ user: null }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ user: null }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
