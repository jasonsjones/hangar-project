import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navbar } from './Navbar'
import { StatusPage } from './StatusPage'
import { RegisterPage } from './RegisterPage'
import { LoginPage } from './LoginPage'
import { UserListPage } from './UserListPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<StatusPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/users" element={<UserListPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
