import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'
import IntroScreen from './components/IntroScreen'
import PhonePrompt from './components/PhonePrompt'
import ResultsTable from './components/ResultsTable'
import inputQuestions from '../Prompt/input.json'
import { createResultEntry, getNextThemeColor, getQuestionCost, getQuestionText, getQuestionTimeLimit, prepareQuestions, STARTING_BALANCE } from './utils/experiment'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const runId = crypto.randomUUID()

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

function App() {
  const [phase, setPhase] = useState('intro')
  const [questionSet, setQuestionSet] = useState(() => prepareQuestions(inputQuestions.questions))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [promptIndex, setPromptIndex] = useState(0)
  const [balance, setBalance] = useState(STARTING_BALANCE)
  const [balanceDelta, setBalanceDelta] = useState(0)
  const [results, setResults] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  const currentQuestion = questionSet[questionIndex]
  const variant = currentQuestion?.variant ?? 'control'
  const messages = currentQuestion?.[variant]?.messages ?? []
  const visibleMessages = useMemo(() => messages.slice(0, promptIndex + 1), [messages, promptIndex])
  const timeLimit = useMemo(() => getQuestionTimeLimit(currentQuestion, variant), [currentQuestion, variant])
  const color = useMemo(() => getNextThemeColor(questionIndex), [questionIndex])
  const promptKey = `${questionIndex}-${promptIndex}`

  useEffect(() => {
    if (phase !== 'finished') {
      return
    }

    const payload = {
      startedAt: new Date().toISOString(),
      balance,
      results,
    }

    window.localStorage.setItem('experiment-results', JSON.stringify(payload))

    if (!supabase) {
      return
    }

    const rows = results.map((result) => ({
      run_id: runId,
      started_at: payload.startedAt,
      balance: payload.balance,
      category: result.category,
      variant: result.variant,
      decision: result.decision,
      cost: result.cost,
      balance_after: result.balanceAfter,
      time_used: result.timeUsed,
      message: result.message,
    }))

    supabase
      .from('results')
      .insert(rows)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to save results to Supabase', error)
        } else {
          console.log("DONE")
        }
      })
  }, [phase, balance, results])

  const handleDecision = (decision) => {
    if (!currentQuestion || isTransitioning) {
      return
    }

    const currentCost = Number(messages[promptIndex]?.cost ?? 0)

    if (decision === 'accept' && currentCost > 0 && balance < currentCost) {
      return
    }

    const cost = decision === 'accept' ? currentCost : 0
    const nextBalance = decision === 'accept' ? Math.max(0, balance - cost) : balance
    const delta = nextBalance - balance
    const resultEntry = createResultEntry(currentQuestion, variant, decision, cost, nextBalance, timeLimit)

    const nextResults = [...results, resultEntry]
    setResults(nextResults)
    setBalance(nextBalance)
    setBalanceDelta(delta)

    if (decision === 'decline' || decision === 'timeout') {
      if (questionIndex + 1 >= questionSet.length) {
        setPhase('finished')
        return
      }

      setQuestionIndex((prev) => prev + 1)
      setPromptIndex(0)
      return
    }

    if (promptIndex + 1 < messages.length) {
      setPromptIndex((prev) => prev + 1)
      return
    }

    if (questionIndex + 1 >= questionSet.length) {
      setPhase('finished')
      return
    }

    setQuestionIndex((prev) => prev + 1)
    setPromptIndex(0)
  }

  const startNewExperiment = () => {
    setQuestionSet(prepareQuestions(inputQuestions.questions))
    setQuestionIndex(0)
    setPromptIndex(0)
    setBalance(STARTING_BALANCE)
    setBalanceDelta(0)
    setResults([])
    setIsTransitioning(false)
  }

  const handleRestart = () => {
    setPhase('intro')
    startNewExperiment()
  }

  const handleDownload = () => {
    const payload = {
      startedAt: new Date().toISOString(),
      balance: balance,
      results,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'output.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (phase === 'intro') {
    return (
      <main className="app-shell">
        <IntroScreen onStart={() => {
          setPhase('running')
          startNewExperiment()
        }} />
      </main>
    )
  }

  if (phase === 'finished') {
    return (
      <main className="app-shell">
        <section className="screen-card">
          <h1>Experiment complete</h1>
          <p className="app-description">Your results have been saved, thanks for your participation!</p>
          {/* <div className="actions-row">
            <button className="primary-btn" onClick={handleRestart}>Start again</button>
            <button className="secondary-btn" onClick={handleDownload}>Download output.json</button>
          </div> */}
          <ResultsTable userResults={results} />
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="screen-card">
        {/* <div className="top-bar">
          <p className="eyebrow">Phone experiment</p>
          <p className="balance-pill">Balance: ${balance}</p>
        </div> */}

        <PhonePrompt
          key={promptKey}
          messages={visibleMessages}
          color={color}
          timeLimit={timeLimit}
          currentQuestionIndex={questionIndex}
          totalQuestions={questionSet.length}
          balance={balance}
          balanceChange={balanceDelta}
          onDecision={handleDecision}
        />

        {isTransitioning ? <p className="helper-text">Loading next prompt…</p> : null}

        <p className="helper-text">
          {currentQuestion?.category} • {variant}
        </p>
      </section>
    </main>
  )
}

export default App
