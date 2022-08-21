export function obfuscate(string: string) {
	const obfuscatedLetters = []

	for (const letter of string.split('')) {
		const charCode = letter.charCodeAt(0)

		if (charCode > 128) {
			obfuscatedLetters.push(letter)
		} else {
			obfuscatedLetters.push('&#'.concat(charCode.toString()))
		}
	}

	return obfuscatedLetters.join(';')
}
