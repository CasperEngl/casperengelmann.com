export function sortDates(a: string, b: string) {
	const aDate = new Date(a)
	const bDate = new Date(b)

	return aDate.getTime() - bDate.getTime()
}
