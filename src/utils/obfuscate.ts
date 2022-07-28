export function obfuscate(string: string) {
  let obfuscatedLetters = []

  for (const letter of string.split('')) {
    let charCode = letter.charCodeAt(0)

    if (charCode > 128) {
      obfuscatedLetters.push(letter)
    } else {
      obfuscatedLetters.push('&#'.concat(charCode.toString()))
    }
  }

  return obfuscatedLetters.join(';')
}
