import { createSignal, Show } from 'solid-js'
import { getSuperKey } from '~/utils/get-super-key'

type Props = {
  email: string
}

const helperText = `Email selected and ready to copy, just press ${getSuperKey()} + C`

let emailRef: HTMLDivElement
let timeout: number | undefined

export const CopyEmail = ({ email }: Props) => {
  const [message, setMessage] = createSignal('')
  const [copyCount, setCopyCount] = createSignal(0)
  const [timeoutMs, setTimeoutMs] = createSignal(0)

  const emojiCount = () => {
    return copyCount() - 15
  }

  const handleCopy = () => {
    clearTimeout(timeout)

    setCopyCount((count) => count + 1)

    if (emojiCount() === 69) {
      setMessage(`${'😉'.repeat(emojiCount())} \nx ${emojiCount()}... nice`)

      setTimeoutMs(2500)
    } else if (copyCount() > 25) {
      setMessage(`${'😉'.repeat(emojiCount())} \nx ${emojiCount()}`)

      setTimeoutMs(2500)
    } else if (copyCount() > 15) {
      setMessage('😉'.repeat(emojiCount()))

      setTimeoutMs(2500)
    } else if (copyCount() > 10) {
      setMessage(`You still haven't had enough? 😳`)

      setTimeoutMs(4000)
    } else if (copyCount() > 5) {
      setMessage(`You're getting there! 😁`)

      setTimeoutMs(3000)
    } else {
      setMessage(`Copied! ${'🎉'.repeat(copyCount())}`)

      setTimeoutMs(1500)
    }

    timeout = setTimeout(() => {
      setMessage(helperText)
      setCopyCount(0)
    }, timeoutMs())
  }

  const handleFocus = () => {
    setMessage(helperText)
    window.getSelection()?.selectAllChildren(emailRef)
  }

  const handleBlur = () => {
    setMessage('')
    clearTimeout(timeout)
    window.getSelection()?.empty()
  }

  return (
    <div class="relative inline-flex flex-wrap gap-2">
      <div
        class="inline-block"
        tabIndex={0}
        ref={emailRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onCopy={handleCopy}
        innerHTML={email}
      />

      <Show when={message()} keyed>
        {(message) => (
          <span
            class="absolute bottom-0 -right-2 translate-x-full whitespace-pre-line text-xs text-gray-500"
            style={
              copyCount() > 15
                ? {
                    'font-size': `${0.75 + copyCount() / 40}rem`,
                    'line-height': `${0.75 + copyCount() / 40}rem`,
                  }
                : undefined
            }
          >
            {message}
          </span>
        )}
      </Show>
    </div>
  )
}
