import { navigator } from '~/utils/get-super-key'

export function usesCommandKey() {
	return (
		navigator?.platform?.includes('Mac') ||
		navigator?.platform?.includes('iPhone') ||
		navigator?.platform?.includes('iPad') ||
		navigator?.platform?.includes('iPod')
	)
}
