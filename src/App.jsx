import { Routes, Route, UNSAFE_DataRouterStateContext } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Transaction from './pages/Transaction/Transaction'
import SpendingPlan from './pages/SpendingPlan'
import Goal from './pages/Goal'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Transaction" element={<Transaction />} />
        <Route path="/SpendingPlan" element={<SpendingPlan />} />
        <Route path="/Goal" element={<Goal />} />
      </Routes>
    </>
  )
}

export default App
