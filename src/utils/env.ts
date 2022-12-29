export function env(key = '', defaultValue = '') {
  return import.meta.env[key] || defaultValue
}
