import { navigator } from './get-super-key'

export function usesControlKey() {
  return (
    navigator?.platform?.includes('Win') ||
    navigator?.platform?.includes('Linux')
  )
}
