import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StatusPage } from './StatusPage'
import { RegisterPage } from './RegisterPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
