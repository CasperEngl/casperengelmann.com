export async function get() {
  const text = `console.log('Hello from API', ${Date.now()});`

  return new Response(text, {
    status: 200,
    headers: {
      'Content-Type': 'text/javascript',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
