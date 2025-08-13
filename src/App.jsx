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
import { AccountProvider } from './contexts/AccountContext'
import { ToastContainer } from 'react-toastify'
import PlaidLayout from "./util/PlaidLayout"

function App() {
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
            <PlaidLayout>
              <Dashboard />
            </PlaidLayout>
          </ProtectedRoute>}
        />
        <Route path="/Transaction" element={
          <ProtectedRoute>
            <PlaidLayout>
              <Transaction />
            </PlaidLayout>
          </ProtectedRoute>}
        />
        <Route path="/SpendingPlan" element={<ProtectedRoute> <SpendingPlan /> </ProtectedRoute>} />
        <Route path="/Goal" element={<ProtectedRoute> <Goal /> </ProtectedRoute>} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000} // close after 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  )
}

export default App
