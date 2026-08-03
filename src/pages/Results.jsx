import { useEffect, useState } from 'react'
import DetailedResultsTable from '../components/DetailedResultTable'

function Results() {
  const [userResults, setUserResults] = useState([])

  useEffect(() => {
    const savedResults = localStorage.getItem('experiment-results')

    if (savedResults) {
      try {
        const data = JSON.parse(savedResults)
        setUserResults(data.results || [])
      } catch (error) {
        console.error('Failed to read saved results', error)
      }
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="screen-card">
        <h1>Experiment Results</h1>

        <p className="app-description">
          Results from all participants are shown below.
        </p>

        <DetailedResultsTable userResults={userResults} />
      </section>
    </main>
  )
}

export default Results
