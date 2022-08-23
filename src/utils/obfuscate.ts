export function obfuscate(string: string) {
	const obfuscatedLetters = []

	for (const letter of string) {
		const charCode = letter.codePointAt(0)

		if (charCode > 128) {
			obfuscatedLetters.push(letter)
		} else {
			obfuscatedLetters.push('&#'.concat(charCode.toString()))
		}
	}

	return obfuscatedLetters.join(';')
}
