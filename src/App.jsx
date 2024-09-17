import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './components/Navbar/Navbar.jsx'
import {ArrowRight} from 'lucide-react'
import Landing from './Landing.jsx'
import Predict from './predict.jsx'
import Home from './components/Homepage/Homepage.jsx'
import Signup from './components/Signup/Signup.jsx'
import Login from './components/Login/Login.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
      </Routes>
    </Router>
  )
}

export default App
