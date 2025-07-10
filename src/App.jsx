import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Account/Login'
import Register from './pages/Account/Register'
import ForgotPassword from './pages/Account/Forgot-password'
import Dashboard from './pages/Dashboard/Dashboard'
import Transaction from './pages/Transaction/Transaction'
import SpendingPlan from './pages/SpendingPlan'
import Goal from './pages/Goal'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Account/Login" element={<Login />} />
        <Route path="/Account/Register" element={<Register />} />
        <Route path="/Account/Forgot-password" element={<ForgotPassword />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Transaction" element={<Transaction />} />
        <Route path="/SpendingPlan" element={<SpendingPlan />} />
        <Route path="/Goal" element={<Goal />} />
      </Routes>
    </>
  )
}

export default App
