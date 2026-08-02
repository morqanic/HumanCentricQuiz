import '../App.css'

function ResultsTable({ results }) {
  if (!results.length) {
    return null
  }

  return (
    <section className="screen-card results-card">
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Variant</th>
            <th>Decision</th>
            <th>Cost</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={`${result.category}-${index}`}>
              <td>{result.category}</td>
              <td>{result.variant}</td>
              <td>{result.decision}</td>
              <td>{result.cost}</td>
              <td>{result.balanceAfter}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ResultsTable
