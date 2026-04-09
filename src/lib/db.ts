export async function getDb() {
  return await import('emdash/runtime').then(({ getDb }) => getDb())
}
