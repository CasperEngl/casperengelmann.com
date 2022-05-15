export async function get() {
  const text = await fetch(
    'https://instinctive-gorgeous.casperengelmann.com/script.js'
  ).then((r) => r.text())

  return new Response(text, {
    status: 200,
    headers: {
      'Content-Type': 'text/javascript',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}
