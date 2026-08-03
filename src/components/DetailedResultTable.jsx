import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import '../App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

function DetailedResultsTable({ userResults = [] }) {
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

  // Add the current user's results so they appear immediately,
  // even if Supabase hasn't finished saving them.
  const currentResults = userResults.map((result) => ({
    category: result.category,
    variant: result.variant,
    decision: result.decision,
    run_id: 'current-user',
  }))

  const allResults = [...savedResults, ...currentResults]

  if (!allResults.length) {
    return null
  }

  // Group results by category/question.
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
          users: new Set(),
          accepted: 0,
          total: 0,

        },
        treatment: {
          users: new Set(),
          accepted: 0,
          total: 0,
        },
      }
    }

    // Count this user for this specific question + variant.
    if (result.run_id) {
      categories[category][variant].users.add(result.run_id)
    }

    if (decision != 'timeout') {
      categories[category][variant].total += 1
    }

    // Count accepted responses.
    if (decision === 'accept') {
      categories[category][variant].accepted += 1
    }
  })

  // highlight user choice
  const userChoices = {}

  userResults.forEach((result) => {
    userChoices[result.category] = {
      variant: result.variant?.toLowerCase().trim(),
      decision: result.decision?.toLowerCase().trim(),
    }
  })

  const getCellClass = (category, variant) => {
    const userChoice = userChoices[category]

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
            <th>Control Users</th>
            <th>Treatment Users</th>
            <th>Control Acceptance</th>
            <th>Treatment Acceptance</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(categories).map(([category, data]) => {
            const controlUsers = data.control.users.size
            const treatmentUsers = data.treatment.users.size

            const controlRate =
              controlUsers > 0
                ? (data.control.accepted / data.control.total) * 100
                : null

            const treatmentRate =
              treatmentUsers > 0
                ? (data.treatment.accepted / data.treatment.total) * 100
                : null

            return (
              <tr key={category}>
                <td>{category}</td>

                <td>
                  {controlUsers}
                </td>

                <td>
                  {treatmentUsers}
                </td>

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

export default DetailedResultsTable
