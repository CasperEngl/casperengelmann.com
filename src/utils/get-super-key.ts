import { usesControlKey } from './uses-control-key'
import { usesCommandKey } from '~/utils/uses-command-key'

export const navigator = globalThis?.navigator ?? {
	platform: '',
}

export function getSuperKey() {
	if (usesCommandKey()) {
		return '⌘'
	} else if (usesControlKey()) {
		return 'ctrl'
	}

	return 'Super'
}
