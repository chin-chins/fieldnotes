import { useState, useEffect } from 'react'
import { supabase } from './client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import SideBar from './components/SideBar'
import Home from './pages/Home'
import AddQuests from './pages/AddQuests'
import MyQuests from './pages/MyQuests'
import About from './pages/About'
import QuestDetail from './pages/QuestDetail'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedQuestId, setSelectedQuestId] = useState(null);

  return (
    <BrowserRouter>
      <div className='app-container'>
        <SideBar/>

        <main className='main-content'>
          <Routes>
            {/* home page */}
            <Route path="/" element={<Home />}/>
            {/* add a quest */}
            <Route path="/add-quest" element={<AddQuests />}/>
            {/* view user quests */}
            <Route path="/my-quests" element={<MyQuests />}/>
            {/* view a quests details */}
            <Route path="quest/:id" element={<QuestDetail />}/>
            {/* about page */}
            <Route path="/about" element={<About />}/>
          </Routes> 
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
