import { useState } from 'react'
import { Routes, Route, UNSAFE_DataRouterStateContext } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login/>} />
      </Routes>
    </>
  )
}

export default App
