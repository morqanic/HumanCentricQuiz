import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import '../App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

function ResultsTable({ userResults }) {
  const [savedResults, setSavedResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResults() {
      const { data, error } = await supabase
        .from('results')
        .select('category, variant, decision, run_id')

      if (error) {
        console.error('Failed to load results from Supabase', error)
        setLoading(false)
        return
      }

      setSavedResults(data || [])
      setLoading(false)
    }

    loadResults()
  }, [])

  if (loading) {
    return (
      <section className="screen-card results-card">
        <h2>Acceptance Likelihood by Category</h2>
        <p>Loading results...</p>
      </section>
    )
  }

  // Convert the current user's results into the same format
  // as the Supabase results.
  const currentResults = userResults.map((result) => ({
    category: result.category,
    variant: result.variant,
    decision: result.decision,
  }))

  // Combine saved results with the current round.
  // This means the current round is included immediately,
  // even if Supabase hasn't finished saving it yet.
  const allResults = [...savedResults, ...currentResults]

  if (!allResults.length) {
    return null
  }

  // Calculate aggregate results.
  const categories = {}

  allResults.forEach((result) => {
    const category = result.category
    const variant = result.variant?.toLowerCase().trim()
    const decision = result.decision?.toLowerCase().trim()

    if (variant !== 'control' && variant !== 'treatment') {
      return
    }

    if (!categories[category]) {
      categories[category] = {
        control: {
          total: 0,
          accepted: 0,
        },
        treatment: {
          total: 0,
          accepted: 0,
        },
      }
    }

    categories[category][variant].total += 1

    if (decision === 'accept') {
      categories[category][variant].accepted += 1
    }
  })

  // Determine what the current user selected.
  const userChoices = {}

  userResults.forEach((result) => {
    userChoices[result.category] = {
      variant: result.variant?.toLowerCase().trim(),
      decision: result.decision?.toLowerCase().trim(),
    }
  })

  const getCellClass = (category, variant) => {
    const userChoice = userChoices[category]

    // User didn't receive this variant.
    if (!userChoice || userChoice.variant !== variant) {
      return 'result-not-received'
    }

    if (userChoice.decision === 'accept') {
      return 'result-accepted'
    }

    if (userChoice.decision === 'decline') {
      return 'result-declined'
    }

    return 'result-not-received'
  }

  return (
    <section className="screen-card results-card">
      <h2>Acceptance Likelihood by Category</h2>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Control</th>
            <th>Treatment</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(categories).map(([category, data]) => {
            const controlRate =
              data.control.total > 0
                ? (data.control.accepted / data.control.total) * 100
                : null

            const treatmentRate =
              data.treatment.total > 0
                ? (data.treatment.accepted / data.treatment.total) * 100
                : null

            return (
              <tr key={category}>
                <td>{category}</td>

                <td className={getCellClass(category, 'control')}>
                  {controlRate !== null
                    ? `${controlRate.toFixed(1)}%`
                    : '—'}
                </td>

                <td className={getCellClass(category, 'treatment')}>
                  {treatmentRate !== null
                    ? `${treatmentRate.toFixed(1)}%`
                    : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export default ResultsTable
