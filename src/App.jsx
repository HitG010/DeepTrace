import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './components/Navbar/Navbar.jsx'
import {ArrowRight} from 'lucide-react'
import Landing from './Landing.jsx'
import Predict from './predict.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/predict" element={<Predict />} />
      </Routes>
    </Router>
  )
}

export default App
