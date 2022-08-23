import { createSignal, Show } from 'solid-js'
import { getSuperKey } from '~/utils/get-super-key'

type Properties = {
	email: string
}

const helperText = `Email selected and ready to copy, just press ${getSuperKey()} + C`

let emailRef: HTMLParagraphElement
let timeout: number | undefined

export const CopyEmail = ({ email }: Properties) => {
	const [message, setMessage] = createSignal('')
	const [copyCount, setCopyCount] = createSignal(0)

	const handleCopy = () => {
		clearTimeout(timeout)
		let timeoutMs = 0

		setMessage((message_) =>
			message_.replace(/x/, '').replace(/\d+/, '').trim()
		)

		if (copyCount() > 30) {
			setMessage((message_) => message_ + '😉'.repeat(copyCount()))

			timeoutMs = 2500
		} else if (copyCount() > 20) {
			setMessage((message_) => message_ + '😉')

			timeoutMs = 2500
		} else if (copyCount() > 15) {
			setMessage('😉')

			timeoutMs = 2500
		} else if (copyCount() > 10) {
			setMessage(`You still haven't had enough?`)

			timeoutMs = 4000
		} else if (copyCount() > 5) {
			setMessage(`You're getting there!`)

			timeoutMs = 3000
		} else if (copyCount() > 0) {
			setMessage((message_) => message_ + '🎉')

			timeoutMs = 1000
		} else {
			setMessage(`Copied! 🎉`)

			timeoutMs = 1500
		}

		if (message().length > 1500) {
			setMessage((message_) => `${message_}\nx ${message_.length}`)
		}

		setCopyCount((count) => count + 1)

		timeout = setTimeout(() => {
			setMessage(helperText)
			setCopyCount(0)
		}, timeoutMs)
	}

	const handleFocus = () => {
		setMessage(helperText)

		window.getSelection().selectAllChildren(emailRef)
	}

	const handleBlur = () => {
		setMessage('')

		window.getSelection().empty()
	}

	return (
		<div class="relative inline-flex flex-wrap gap-2">
			<p
				class="inline-block"
				tabIndex={0}
				ref={emailRef}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onCopy={handleCopy}
			>
				{email}
			</p>

			<Show when={message()}>
				{(message) => (
					<span class="absolute bottom-0 -right-2 max-w-[9rem] translate-x-full whitespace-pre-line text-xs text-gray-500">
						{message}
					</span>
				)}
			</Show>
		</div>
	)
}
