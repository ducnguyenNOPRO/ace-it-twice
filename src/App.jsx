import { Routes, Route, UNSAFE_DataRouterStateContext } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard/Dashboard'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard/>} />
      </Routes>
    </>
  )
}

export default App
