export function obfuscate(value: string) {
  return Array.from(value)
    .flatMap((letter) => {
      const charCode = letter.codePointAt(0)

      if (!charCode) {
        return []
      }

      return charCode > 128 ? letter : '&#'.concat(charCode.toString())
    })
    .join(';')
}
