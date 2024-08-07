export const email = 'me@casperengelmann.com'

export async function GET() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `mailto:${email}`,
    },
  })
}
