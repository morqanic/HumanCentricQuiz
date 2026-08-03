import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Experiment from './pages/Experiment'
import Results from './pages/Results'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Experiment />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
