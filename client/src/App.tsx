import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './component/Home'
import { Register } from './component/Register'
import { Login } from './component/Login'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path="/home" element={
              <Home />
      }/>
      <Route path="*" element={<Navigate to="/"/>} />
    </Routes>
  )
}

export default App
