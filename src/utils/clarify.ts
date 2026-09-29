export function clarify(value: string) {
  return value
    .split(';')
    .map((letter) => {
      const digitsString = letter.replace(/[^\d.]+/g, '')
      const codePoint = Number.parseInt(digitsString, 10)

      return String.fromCodePoint(codePoint)
    })
    .join('')
}
