import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Account/Login'
import Register from './pages/Account/Register'
import ForgotPassword from './pages/Account/Forgot-password'
import Dashboard from './pages/Dashboard/Dashboard'
import Transaction from './pages/Transaction/Transaction'
import SpendingPlan from './pages/SpendingPlan'
import Setting from './pages/Setting/Setting'
import Goal from './pages/Goal'
import ProtectedRoute from './components/ProtectRoute'
import './App.css'
import { TransactionProvider } from './contexts/TransactionContext'
import { useAuth } from './contexts/authContext'

function App() {
  const { currentUser} = useAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Account/Login" element={<Login />} />
        <Route path="/Account/Register" element={<Register />} />
        <Route path="/Account/Forgot-password" element={<ForgotPassword />} />
        <Route path="/Setting" element={<ProtectedRoute> <Setting /> </ProtectedRoute>}/>
        <Route path="/Dashboard" element={
          <ProtectedRoute>
            <TransactionProvider>
              <Dashboard />
            </TransactionProvider>
          </ProtectedRoute>}
        />
        <Route path="/Transaction" element={
          <ProtectedRoute>
            <TransactionProvider>
              <Transaction/>
            </TransactionProvider>
          </ProtectedRoute>}
        />
        <Route path="/SpendingPlan" element={<ProtectedRoute> <SpendingPlan /> </ProtectedRoute>} />
        <Route path="/Goal" element={<ProtectedRoute> <Goal /> </ProtectedRoute>} />
        </Routes>
    </>
  )
}

export default App
