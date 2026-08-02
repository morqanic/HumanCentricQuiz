import { useEffect, useMemo, useRef, useState } from 'react'
import '../App.css'

function PhonePrompt({
  messages,
  banner,
  color,
  timeLimit,
  onDecision,
  currentQuestionIndex,
  totalQuestions,
  balance,
  balanceChange,
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [hasResponded, setHasResponded] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showBalanceChange, setShowBalanceChange] = useState(false)
  const [isFadingBalanceChange, setIsFadingBalanceChange] = useState(false)
  const hasRespondedRef = useRef(false)

  const promptTexts = useMemo(
    () => (messages ?? []).map((message) => message.text),
    [messages]
  )

  const currentCost = Number(
    messages?.[messages.length - 1]?.cost ?? 0
  )

  const canAccept = currentCost <= 0 || balance >= currentCost
  const insufficientBalance = currentCost > 0 && balance < currentCost

  const changeLabel =
    balanceChange > 0
      ? `▲ +$${Math.abs(balanceChange)}`
      : balanceChange < 0
        ? `▼ -$${Math.abs(balanceChange)}`
        : ''

  const changeStyle =
    balanceChange > 0
      ? { color: '#166534' }
      : balanceChange < 0
        ? { color: '#b91c1c' }
        : { color: '#4b3f4d' }

  useEffect(() => {
    hasRespondedRef.current = false
    setHasResponded(false)
    setErrorMessage('')
    setTimeLeft(timeLimit)

    const timeoutId = window.setTimeout(() => {
      if (!hasRespondedRef.current) {
        hasRespondedRef.current = true
        setHasResponded(true)
        onDecision('timeout')
      }
    }, timeLimit * 1000)

    return () => window.clearTimeout(timeoutId)
  }, [timeLimit, messages?.length, onDecision])

  useEffect(() => {
    if (insufficientBalance) {
      setErrorMessage(
        `You need at least $${currentCost} to accept this prompt.`
      )
      return
    }

    setErrorMessage('')
  }, [insufficientBalance, currentCost])

  useEffect(() => {
    if (balanceChange === 0) {
      setShowBalanceChange(false)
      return
    }

    setIsFadingBalanceChange(false)
    setShowBalanceChange(true)

    const timerId = window.setTimeout(() => {
      setIsFadingBalanceChange(true)
    }, 500)

    const hideTimerId = window.setTimeout(() => {
      setShowBalanceChange(false)
      setIsFadingBalanceChange(false)
    }, 900)

    return () => {
      window.clearTimeout(timerId)
      window.clearTimeout(hideTimerId)
    }
  }, [balanceChange])

  useEffect(() => {
    if (hasRespondedRef.current) {
      return
    }

    if (timeLeft <= 0) {
      return
    }

    const countdownId = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearInterval(countdownId)
  }, [timeLeft, hasResponded])

  const handleChoice = (decision) => {
    if (hasRespondedRef.current) {
      return
    }

    if (decision === 'accept' && !canAccept) {
      setErrorMessage(
        `You need at least $${currentCost} to accept this prompt.`
      )
      return
    }

    setErrorMessage('')

    hasRespondedRef.current = true
    setHasResponded(true)
    onDecision(decision)
  }

  return (
    <section
      className="phone-card"
      style={{ '--phone-accent': color }}
    >
      <div className="phone-shell">
        <div className="phone-screen">
          <div className="phone-header">
            <span>
              Question {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <div className="timer-bar">
              <div
                className="timer-bar-fill"
                style={{
                  width: `${Math.max(0, (timeLeft / timeLimit) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="phone-content">

            {banner ? (
              <div className="experiment-banner">
                {banner}
              </div>
            ) : null}

            {promptTexts.length > 0
              ? promptTexts.map((text, index) => (
                  <div
                    key={`${text}-${index}`}
                    className={`phone-bubble ${
                      index === 0
                        ? 'primary-bubble'
                        : 'secondary-bubble'
                    }`}
                  >
                    <p>{text}</p>
                  </div>
                ))
              : null}

            <div className="balance-summary">
              <p className="balance-pill">
                Balance: ${balance}
              </p>

              {showBalanceChange ? (
                <p
                  className={`balance-change ${
                    isFadingBalanceChange
                      ? 'balance-change-fade'
                      : ''
                  }`}
                  style={changeStyle}
                >
                  {changeLabel}
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <p
                className="helper-text"
                role="alert"
                style={{
                  color: '#b91c1c',
                  marginTop: '0.5rem',
                }}
              >
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="phone-actions">
            <button
              className="decline-btn"
              onClick={() => handleChoice('decline')}
            >
              Decline
            </button>

            <button
              className="accept-btn"
              onClick={() => handleChoice('accept')}
              disabled={!canAccept}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PhonePrompt
