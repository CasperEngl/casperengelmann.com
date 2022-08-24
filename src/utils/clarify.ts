export function clarify(value: string) {
	const clarifiedLetters: string[] = []

	for (const letter of value.split(';')) {
		const digitsString = letter.replace(/[^\d.]+/g, '')
		const codePoint = Number.parseInt(digitsString, 10)

		clarifiedLetters.push(String.fromCodePoint(codePoint))
	}

	return clarifiedLetters
}
