export async function GET() {
  return new Response(
    'google.com, pub-7462168937721680, DIRECT, f08c47fec0942fa0\n',
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}
