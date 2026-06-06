import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StatusPage } from './StatusPage'
import { RegisterPage } from './RegisterPage'
import { LoginPage } from './LoginPage'
import { UserListPage } from './UserListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/users" element={<UserListPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
