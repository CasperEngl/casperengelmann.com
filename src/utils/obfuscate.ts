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
