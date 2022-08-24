export function obfuscate(value: string) {
	const obfuscatedLetters: string[] = []

	for (const letter of value) {
		const charCode = letter.codePointAt(0)

		if (charCode > 128) {
			obfuscatedLetters.push(letter)
		} else {
			obfuscatedLetters.push('&#'.concat(charCode.toString()))
		}
	}

	return obfuscatedLetters.join(';')
}

export function clarify(value: string) {
	const clarifiedLetters: string[] = []

	for (const letter of value.split(';')) {
		const digitsString = letter.replace(/[^\d.]+/g, '')
		const codePoint = Number.parseInt(digitsString, 10)

		clarifiedLetters.push(String.fromCodePoint(codePoint))
	}

	return clarifiedLetters
}
